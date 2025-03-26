import { IOrderContacts } from "../types";
import { Form } from "./common/Form";
import { IEvents } from "./base/events";

export class Contacts extends Form<IOrderContacts> {
    constructor(container: HTMLFormElement, events: IEvents) {
        super(container, events);
    }

    set phone(value: string) {
        (this.container.elements.namedItem('phone') as HTMLInputElement).value = value;
        this.onInputChange('phone', value);
    }

    set email(value: string) {
        (this.container.elements.namedItem('email') as HTMLInputElement).value = value;
        this.onInputChange('email', value);
    }

    clearContactsValue() {
        this.phone = '';
        this.email = '';
    }
}