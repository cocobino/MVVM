const Processor = class {
    cat;
    constructor(category) {
        this.cat =category;
        Object.freeze(this);
    }
    process(vm, el, k, v, _0=type(vm, ViewModel), _1 = type(el, HTMLElement), _2=type(k, 'string')) {
        this._process(vm, el, k, v);//hook
    }
    _process(vm, el, k, v) {throw 'override';}
};


new (class extends Processor {
    _process(vm, el, k, v) {el.style[k] = v;}
})('styles');