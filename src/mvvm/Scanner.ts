import Binder from "./Binder";
import BinderItem from "./BinderItem";

class Scanner {
    checkItem(binder: Binder, el: HTMLElement) {
        const vm = el.getAttribute('data-viewmodel');
        if (vm) {
            debugger
            binder.add(new BinderItem(el, vm));
        }
    }

    scan(el: HTMLElement) {
        const binder = new Binder();
        this.checkItem(binder, el);

        const stack = [el.firstElementChild];
        let target: Element | undefined;
        while (target = stack.pop() as HTMLElement) {
            this.checkItem(binder, target as HTMLElement);
            if (target.firstElementChild) stack.push(target.firstElementChild);
            if (target.nextElementSibling) stack.push(target.nextElementSibling);
        }
        return binder;
    }
}

export default Scanner