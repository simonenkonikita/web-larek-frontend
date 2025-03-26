import './scss/styles.scss';

import { API_URL, CDN_URL } from './utils/constants';
import { WebLarekAPI } from './components/common/WebLarekAPI';

import { EventEmitter } from './components/base/events';
import { cloneTemplate, ensureElement } from './utils/utils';
import { ICardProduct, IOrder } from './types';
import { Card } from './components/Card';
import { Success } from './components/common/Sussess';

import { AppState } from './components/AppData';
import { Basket } from './components/common/Basket';
import { Modal } from './components/common/Modal';
import { Order } from './components/Order';
import { Page } from './components/common/Page';
import { Contacts } from './components/Contact';

const api = new WebLarekAPI(API_URL, CDN_URL);
const events = new EventEmitter();
const appData = new AppState({}, events);

events.onAll(({ eventName, data }) => {
    console.log(eventName, data);
})

// template
const successTemplate = ensureElement<HTMLTemplateElement>('#success');
const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const cardBasketTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const orderTemplate = ensureElement<HTMLTemplateElement>('#order');
const contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');

const page = new Page(document.body, events);
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);

const basket = new Basket(cloneTemplate(basketTemplate), events);
const order = new Order(cloneTemplate(orderTemplate), events);
const contacts = new Contacts(cloneTemplate(contactsTemplate), events);


// Дальше идет бизнес-логика
// Поймали событие, сделали что нужно

// Отобразить список продуктов
events.on('catalog:changed', () => {
    page.catalog = appData.catalog.map((item) => {
        const card = new Card('card', cloneTemplate(cardCatalogTemplate), {
            onClick: () => events.emit('card:select', item),
        });
        return card.render({
            title: item.title,
            image: item.image,
            category: item.category,
            price: item.price,
        });
    });
});

// Открыть товар
events.on('card:select', (item: ICardProduct) => {
    const isInBasket = !appData.checkProductBasket(item);
    const card = new Card('card', cloneTemplate(cardPreviewTemplate), {
        onClick: () => {
            if (isInBasket) {
                events.emit('card:delete', item);
            } else {
                events.emit('card:add', item);
            }
        },
    });
    card.selected = appData.checkProductBasket(item);
    modal.render({
        content: card.render({
            title: item.title,
            image: item.image,
            description: item.description,
            price: item.price,
            category: item.category,
        }),
    });
});

// Добавить в корзину
events.on('card:add', (item: ICardProduct) => {
    appData.addToOrder(item);
    page.counter = appData.counter;
    modal.close();
});

// Открыть корзину
events.on('basket:open', () => {
    appData.clearOrderFields();
    order.clearOrderValue();
    contacts.clearContactsValue();
    basket.total = appData.total;
    basket.items = appData.basket.map((item, index) => {
        const card = new Card('card', cloneTemplate(cardBasketTemplate), {
            onClick: () => events.emit('basket:delete', item),
        });
        return card.render({
            title: item.title,
            price: item.price,
            index: appData.getIndex(index)
        });
    });
    basket.selected = appData.order.items;
    modal.render({
        content: basket.render(),
    });
});

// Удалить товар из корзины
events.on('card:delete', (item: ICardProduct) => {
    appData.removeFromOrder(item);
    page.counter = appData.counter;
    modal.close();
});

// Удалить товар из карточки товара 
events.on('basket:delete', (item: ICardProduct) => {
    appData.removeFromOrder(item);
    page.counter = appData.counter;
    // Обновляем корзину
    events.emit('basket:open');
});

// Открыть окно оформления заказа
events.on('order:open', () => {
    appData.clearOrderFields();
    modal.render({
        content: order.render({
            valid: false,
            errors: '',
        }),
    });
    if (appData.order.payment) {
        order.payment = appData.order.payment;
    }
});

// Переход к форме с контактными данными
events.on('order:submit', () => {
    if (appData.validateOrder('address') && appData.order.payment) {
        modal.render({
            content: contacts.render({
                valid: false,
                errors: '',
            }),
        });
    } else {
        order.errors = 'Заполните все поля формы доставки';
    }
});

// Выбор способа оплаты
events.on('payment:change', (data: { payment: string }) => {
    appData.setOrderField('payment', data.payment);
});

// Проверка валидности формы
events.on('formErrors:changed', (errors: Partial<IOrder>) => {
    const { email, phone, address, payment } = errors;
    order.valid = !address && !email && !phone && !payment;
    contacts.valid = !address && !email && !phone && !payment;
    order.errors = Object.values(errors)
        .filter((i) => !!i)
        .join('; ');
    contacts.errors = Object.values({ email, phone })
        .filter((i) => !!i)
        .join('; ');
});

// Изменилось одно из полей
events.on(
    /(^order|^contacts)\..*:change/,
    (data: { field: keyof Omit<IOrder, 'items' | 'total'>; value: string }) => {
        appData.setOrderField(data.field, data.value);
    }
);

// Отправление формы заказа
events.on('contacts:submit', () => {
    if (appData.validateOrder('email') && appData.validateOrder('phone')) {
        api.orderProduct(appData.order)
            .then((result) => {
                appData.clearBasket();
                appData.clearOrderFields();
                page.counter = appData.counter;
                const success = new Success(
                    cloneTemplate(successTemplate),
                    {
                        onClick: () => {
                            modal.close();
                        },
                    }
                );
                modal.render({
                    content: success.render({
                        total: result.total,

                    }),
                });
            })
            .catch((err) => {
                console.error(err);
            })
    }
});

// Получение списка продуктов с сервера
api.getProductsList()
    .then(appData.setCatalog.bind(appData))
    .catch(err => {
        console.error(err);
    });

// Блокировка прокрутки страницы при открытом попапе
events.on('modal:open', () => {
    page.locked = true;
});

// Разблокировка прокрутки страницы при закрытом попапе
events.on('modal:close', () => {
    page.locked = false;
});


