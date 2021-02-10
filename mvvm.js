const type = (target, type) => {
    if(typeof type == 'string') {
        if(typeof target != type) throw `invalid type ${target} : ${type}`;
    } else if(!(target instanceof type)) throw `invalid type ${target} : ${type}`;
    return target;
};

const ViewModelListener = class {
    viewmodelUpdate(updated) {throw 'override';}
};

const ViewModelValue = class {
    subKey; cat; k; v;
    constructor(subKey, cat, k, v) {
        this.subKey = subKey;
        this.cat=cat;
        this.k = k;
        this.v = v;
        Object.freeze(this);
    }
};

const ViewModel = class extends ViewModelListener{
    static get(data) {
        return new ViewModel(data);
    }

    addListener(v, _=type(v, ViewModelListener)) {
        this.listeners.add(v);
    }

    removeListener(v, _=type(v, ViewModelListener)) {
        this.listeners.delete(v);
    }

    notify() {
        this.listeners.forEach(v => v.viewmodelUpdated(this.isUpdated));
    }

    styles ={}; attributes ={}; properties ={}; events ={};
    isUpdated = new Set; listeners = new Set;
    subKey = ''; parent = null;

    constructor(data) {
        Object.entries(data).forEach(([k, obj]) => {
            if('styles,attributes,properties'.includes(k)) {
                this[k] = Object.defineProperties(obj, 
                    Object.entries(obj).reduce((r, [k, v]) => {
                        r[k] = {
                            enumerable: true,
                            get:_=>v,
                            set:newV=>{
                                v = newV;
                                // v값을 기억해야함, 어떤 k,v 인지 알아야함
                                vm.isUpdated.add(new ViewModelValue(cat, k, v));
                            }
                        };
                        return r;
                    }, {}));
            } else {
                    Object.definePropertiy(this, k, {
                            enumerable: true,
                            get:_=>v,
                            set:newV=>{
                                v = newV;
                                // v값을 기억해야함, 어떤 k,v 인지 알아야함
                                vm.isUpdated.add(new ViewModelValue(this.subKey, "", k, v));
                            }
                        });
                        // ViewModel 이들어오면 다시 isupdate 에 넣어줘야함
                        if(v instanceof ViewModel) {
                            v.parent = this;
                            v.subKey = k;
                            v.addListener(this);
                        }
                    }
                });
                ViewModel.notify(this);
                Object.seal(this);
            }

    viewmodelUpdated(updated) {
        updated.forEach(v => this.isUpdated.add(v));
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

const Binder = class extends ViewModelListener{
    items = new Set; //객체지향 -> 메모리의 주소 객체의 메모리할당을 위해 Set으로 넣어야함
    processors = {};
    add(v, _ = type(v, BinderItem)) { this.items.add(v); }
    addProcessor(v, _0=type(v, Processor)) {
        this.processors[v.cat] = v;
    }

    watch(viewmodel, _ = type(viewmodel, ViewModel)) {
        viewmodel.addListener(this);
        this.render(viewmodel);
    }
    unwatch(viewmodel, _=type(viewmodel, ViewModel)) {
        viewmodel.removeListener(this);
    }

    viewmodelUpdated(updated) {
        const items = {};
        this.items.forEach(item => {
            items[item.viewmodel] = [
                type(viewmodel[item.viewmodel]. ViewModel),
                item.el
            ];
        });
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

const scanner = new Scanner;
const binder = scanner.scan(document.querySelector("#target"));
binder.addProcessor(new (class extends Processor{
    _process(vm, el, k, v){el.style[k] = v;}
})("styles"));
binder.addProcessor(new (class extends Processor{
    _process(vm, el, k, v){el.setAttribute(k, v);}
})("attributes"));
binder.addProcessor(new (class extends Processor{
    _process(vm, el, k, v){el[k] = v;}
})("properties"));
binder.addProcessor(new (class extends Processor{
    _process(vm, el, k, v){
        console.log("event", k, v, el)
        el["on" + k] =e=>v.call(el, e, vm);
    }
})("events"));
const viewmodel = ViewModel.get({
    isStop:false,
    changeContents(){
        this.wrapper.styles.background = `rgb(${parseInt(Math.random()*150) + 100},${parseInt(Math.random()*150) + 100},${parseInt(Math.random()*150) + 100})`;
        this.contents.properties.innerHTML = Math.random().toString(16).replace(".", "");
    },
    wrapper:ViewModel.get({
        styles:{
            width:"50%",
            background:"#ffa",
            cursor:"pointer"
        },
        events:{
            click(e, vm){
                vm.parent.isStop = true;
                console.log("click", vm)
            }
        }
    }),
    title:ViewModel.get({
        properties:{
            innerHTML:"Title"
        }
    }),
    contents:ViewModel.get({
        properties:{
            innerHTML:"Contents"
        }
    })
});
binder.watch(viewmodel);
const f =_=>{
    viewmodel.changeContents();
  if(!viewmodel.isStop) requestAnimationFrame(f);
};
requestAnimationFrame(f);