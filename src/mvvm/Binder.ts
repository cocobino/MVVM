import ViewModel from "./ViewModel";
import BinderItem from "./BinderItem";

class Binder {
    item = new Set<BinderItem>();

    add(v:BinderItem) {
        this.item.add(v);
    }

    render(viewmodel:ViewModel) {
        this.item.forEach(item => {
            const vm = viewmodel[item.viewmodel], el = item.el;
            Object.entries(vm.styles).forEach(([k, v]) => el.style[k] = v);
            Object.entries(vm.attributes).forEach(([k, v]) => el.setAttribute(k, v));
            Object.entries(vm.properties).forEach(([k, v]) => el[k] = v);
            Object.entries(vm.events).forEach(([k, v]) => el["on" + k] = (e) => v.call(el, e, viewmodel));
        });
    }

}

export default Binder;