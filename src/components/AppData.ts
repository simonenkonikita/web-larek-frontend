import { FormError, IAppData, ICardProduct, IOrder } from "../types";
import { Model } from "./base/model";

export class AppState extends Model<IAppData> {
	catalog: ICardProduct[] = [];
	order: IOrder = {
		payment: '',
		address: '',
		email: '',
		phone: '',
		items: [],
		total: 0,
	};
	formErrors: FormError = {};

	// Очистка корзины
	clearBasket() {
		this.order.items = []
		this.order.total = 0;
	}

	// Очистка полей заказа
	clearOrderFields() {
		this.order.payment = '';
		this.order.address = '';
		this.order.email = '';
		this.order.phone = '';
	}


	// Подсчет суммы заказа
	get total() {
		return this.order.items.reduce(
			(a, c) => a + this.catalog.find((it) => it.id === c).price,
			0
		);
	}

	// Получить товары из корзины
	get basket() {
		return this.catalog.filter((item) => this.order.items.includes(item.id));
	}

	// Проверка на наличие товара в корзине и его цены
	checkProductBasket(item: ICardProduct): boolean | null {
		if (item.price === null) {
			return null;
		}
		return !this.order.items.includes(item.id);
	}

	// Наполнить каталог
	setCatalog(items: ICardProduct[]) {
		this.catalog = items;
		this.emitChanges('catalog:changed', { catalog: this.catalog });
	}

	// Установить поле заказа и проверить форму
	setOrderField(field: keyof Omit<IOrder, 'items' | 'total'>, value: string) {
		this.order[field] = value;
		if (this.validateOrder(field)) {
			this.emitChanges('order:ready', this.order);
		}
	}

	// Проверить форму
	validateOrder(field: keyof IOrder) {
		const errors: typeof this.formErrors = {};

		// Проверка email и телефона
		if (field !== 'address' && field !== 'payment') {
			if (!this.order.email?.trim()) {
				errors.email = 'Необходимо указать email';
			} else if (!this.order.email.includes('@')) {
				errors.email = 'Email должен содержать @';
			}

			if (!this.order.phone?.trim()) {
				errors.phone = 'Необходимо указать телефон';
			} else if (this.order.phone.replace(/\D/g, '').length < 10) {
				errors.phone = 'Телефон слишком короткий';
			}
		}
		// Проверка адреса и способа оплаты
		else {
			if (!this.order.address?.trim()) {
				errors.address = 'Необходимо указать адрес';
			}

			if (!this.order.payment) {
				errors.payment = 'Необходимо выбрать тип оплаты';
			}
		}

		this.formErrors = errors;
		this.emitChanges('formErrors:changed', this.formErrors);

		return Object.keys(errors).length === 0;
	}

	// Добавить продукт в заказ
	addToOrder(item: ICardProduct) {
		this.order.items.push(item.id);
		this.order.total = this.total;
	}

	// Удалить продукт из заказа
	removeFromOrder(product: ICardProduct) {
		this.order.items = this.order.items.filter(
			(item) => item !== product.id
		);
		this.order.total = this.total;
	}

	// Кол-во товаров в заказе
	get counter(): number {
		return this.order.items.length;
	}

	// Коррекция индекса в корзине 
	getIndex(index: number): number {
		return index + 1;
	}
}
