const type = (target, type) => {
    if(typeof type == 'string') {
        if(typeof target != type) throw `invalid type ${target} : ${type}`;
    } else if(!(target instanceof type)) throw `invalid type ${target} : ${type}`;
    return target;
};


const ViewModel = class {
    static get(data) {
        return new ViewModel(data);
    }

    styles ={}; attributes ={}; properties ={}; events ={};
    constructor(data) {
        // if(checker != ViewModel.private) throw 'use ViewModel.get()'; //외부에서 생성 불가능

        Object.entries(data).forEach(([k, v]) => {
            switch(k) {
                case 'styles': this.styles = v; break;
                case 'attributes': this.attributes = v; break;
                case 'properties': this.properties = v; break;
                case 'events': this.events = v; break;
                default: this[k] = v;
            }
        });
        Object.seal(this);
    }
};

const BinderItem = class {
    el; viewmodel;

    constructor(el, viewmodel, _0=typeof(el, HTMLElement), _1=type(viewmodel, 'string')) {
        this.el = el;
        this.viewmodel = viewmodel;
        Object.freeze(this);
    }
};

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

/*
new (class extends Processor {
    _process(vm, el, k, v) {el.style[k] = v;}
})('styles')
*/

const Binder = class {
    items = new Set; //객체지향 -> 메모리의 주소 객체의 메모리할당을 위해 Set으로 넣어야함
    processors = {};
    add(v, _ = type(v, BinderItem)) { this.items.add(v); }
    addProcessor(v, _0=type(v, Processor)) {
        this.processors[v.cat] = v;
    }

    render(viewmodel, _ = type(viewmodel, ViewModel)) {
        const processores = Object.entries(this.processors);
        this.items.forEach(item => {
            //타입이 감수해야할 책임을 다른곳에 미루면안됨
            const vm = type(viewmodel[item.viewmodel], ViewModel), el = item.el;

            //제어역전된 그리는 코드
            processores.forEach(([pk, processor]) => {
                Object.entries(vm[pk]).forEach(([k, v]) => {
                    processor.process(vm, el, k, v);
                });
            });
        });
    }
};

const Scanner = class {
    scan(el, _ = type(el, HTMLElement)) {
        const binder = new Binder;
        this.checkItem(binder, el);
        const stack = [el.firstElementChild];
        let target;
        while(target = stack.pop()) {
            this.checkItem(binder, target);
            if(target.firstElementChild) stack.push(target.firstElementChild);
            if(target.nextElementSibling) stack.push(target.nextElementSibling);
        }
        return binder;
    }

    checkItem(binder, el) {
        const vm = el.getAttribute('data-viewmodel');
        if(vm) binder.add(new BinderItem(el, vm));
    }
};