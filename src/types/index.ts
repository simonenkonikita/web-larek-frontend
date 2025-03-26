export const productCategory: Record<string, string> = {
        'софт-скил': 'card__category_soft',
        'хард-скил': 'card__category_hard',
        'кнопка': 'card__category_button',
        'другое': 'card__category_other',
        'дополнительное': 'card__category_additional',
};

// Интерфейс карточки товара
export interface ICardProduct {
        id: string;
        title: string;
        category: string;
        description: string;
        image: string;
        price: number | null;
        index: number;
}

export type IPayment = `card` | `cash`

// Интерфейс состояния приложения
export interface IAppData {
        catalog: ICardProduct[];
        order: IOrder | null;
        basket: ICardProduct[] | null;
}

// Интерфейс заказа
export interface IOrder {
        address: string;
        payment: string;
        email: string;
        phone: string;
        total: number;
        items: string[];
}

// Интерфейс формы контактные данные
export type IOrderContacts = Pick<IOrder, `email` | `phone`>

// Интерфейс формы доставки
export interface IOrderDelivery {
        payment: IPayment;
        address: string;
}

// Интерфейс списка продуктов
export interface IProductList {
        total: number;
        items: ICardProduct[];
}

// Интерфейс успешного заказа
export interface ISuccess {
        id: string[];
        total: number;
}

// Тип ошибок формы
export type FormError = Partial<Record<keyof IOrder, string>>;







