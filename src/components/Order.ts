import { IOrderDelivery } from "../types";
import { Form } from "./common/Form";
import { IEvents } from "./base/events";


export class Order extends Form<IOrderDelivery> {
    protected _paymentButtons: HTMLButtonElement[];


    constructor(container: HTMLFormElement, events: IEvents) {
        super(container, events);
        this._paymentButtons = Array.from(container.querySelectorAll('.button_alt')
        ) as HTMLButtonElement[];
        if (this._paymentButtons.length) {
            this._paymentButtons.forEach((button) => {
                button.addEventListener('click', () => {
                    this._paymentButtons.forEach((button) => {
                        this.toggleClass(button, 'button_alt-active', false);
                    });
                    this.toggleClass(button, 'button_alt-active', true);
                    this.payment = button.name;
                });
            });
        }
    }

    set address(value: string) {
        (this.container.elements.namedItem('address') as HTMLInputElement).value =
            value;
    }

    set payment(value: string) {
        this.events.emit('payment:change', { payment: value });
    }

    clearOrderValue() {
        this.payment = '';
        this.address = '';
        this._paymentButtons.forEach(button => {
            this.toggleClass(button, 'button_alt-active', false);
        });
    }

}
