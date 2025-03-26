import { ICardProduct, productCategory } from "../types";
import { ensureElement } from "../utils/utils";
import { Component } from "./base/component";

export interface ICardActions {
	onClick: (event: MouseEvent) => void;
}

export class Card extends Component<ICardProduct> {
	protected _title: HTMLElement;
	protected _image?: HTMLImageElement;
	protected _description?: HTMLElement;
	protected _category?: HTMLElement;
	protected _price?: HTMLElement;
	protected _index?: HTMLElement;
	protected _button?: HTMLButtonElement;

	constructor(
		protected blockName: string,
		container: HTMLElement,
		actions?: ICardActions
	) {
		super(container);

		this._title = ensureElement<HTMLElement>(`.${blockName}__title`, container);
		this._image = container.querySelector(`.${blockName}__image`);
		this._button = container.querySelector(`.${blockName}__button`);
		this._description = container.querySelector(`.${blockName}__text`);
		this._category = container.querySelector(`.${blockName}__category`);
		this._price = container.querySelector(`.${blockName}__price`);
		this._index = container.querySelector(`.basket__item-index`);

		if (actions?.onClick) {
			if (this._button) {
				this._button.addEventListener('click', actions.onClick);
			} else {
				container.addEventListener('click', actions.onClick);
			}
		}
	}

	set id(value: string) {
		this.container.dataset.id = value;
	}

	get id(): string {
		return this.container.dataset.id || '';
	}

	set title(value: string) {
		this.setText(this._title, value);
	}

	get title(): string {
		return this._title.textContent || '';
	}

	set image(value: string) {
		this.setImage(this._image, value, this.title);
	}

	set description(value: string | string[]) {
		if (Array.isArray(value)) {
			this._description.replaceWith(
				...value.map((str) => {
					const descTemplate = this._description.cloneNode() as HTMLElement;
					this.setText(descTemplate, str);
					return descTemplate;
				})
			);
		} else {
			this.setText(this._description, value);
		}
	}

	set category(value: string) {
		const categoryClass = productCategory[value];
		if (categoryClass) {
			this._category.classList.add(categoryClass);
		}
		this.setText(this._category, value);
	}

	get category(): string {
		return this._category.textContent || '';
	}

	set price(value: string | null) {
		const text = value === null ? 'Бесценно' : `${value} синапсов`;
		this.setText(this._price, text);
	}

	get price(): string {
		return this._price.textContent || '';
	}

	set index(value: number) {
		this.setText(this._index, value.toString());
	}

	set selected(state: boolean | null) {
		if (state === null) {
			this.setDisabled(this._button, true);
			this._button.textContent = "Недоступно";
		} else {
			this.setDisabled(this._button, false);
			this._button.textContent = state ? "Добавить в корзину" : "Удалить из корзины";
		}
	}

	/* set selected(state: boolean | null) {
		if (state === null) {
			this.setDisabled(this._button, true);
			this._button.textContent = "Недоступно";
		} else if (state) {

			this.setDisabled(this._button, false);
			this._button.textContent = "Добавить в корзину";
		} else {

			this.setDisabled(this._button, true);
			this._button.textContent = "Уже в корзине";
		}
	} */
}













