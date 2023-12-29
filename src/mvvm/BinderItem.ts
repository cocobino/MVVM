
class BinderItem {
    el:HTMLElement;
    viewmodel:string;

    constructor(el: HTMLElement, viewmodel:string) {
        this.el =el;
        this.viewmodel = viewmodel;

        Object.freeze(this);
    }
}

export default BinderItem