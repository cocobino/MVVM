const type = (target, type) => {
    if(typeof type == 'string') {
        if(typeof target != type) throw `invalid type ${target} : ${type}`;
    } else if(!(target instanceof type)) throw `invalid type ${target} : ${type}`;
    return target;
};
/*
searchData = {
        keyword : '', //검색옵션
        isManager : '', //구분 필터값
        isSubManager : '',
        currentPage: 1,
        pageSize: 10,
        memberStatusValueCode: ''
    };
 */

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

const Binder = class {
    items = new Set; //객체지향 -> 메모리의 주소 객체의 메모리할당을 위해 Set으로 넣어야함
    add(v, _ = type(v, BinderItem)) { this.items.add(v); }

    render(viewmodel, _ = type(viewmodel, ViewModel)) {
        this.items.forEach(item => {
            //타입이 감수해야할 책임을 다른곳에 미루면안됨
            const vm = type(viewmodel[item.viewmodel], ViewModel), el = item.el;

            //제어역전된 그리는 코드
            Object.entries(vm.styles).forEach(([k, v]) => el.styles[k] = v);
            Object.entries(vm.attributes).forEach(([k, v]) => el.attributes(k, v));
            Object.entries(vm.properties).forEach(([k, v]) => {
                el[k] = v;
            });
            Object.entries(vm.events).forEach(([k, v]) => el['on' + k] = e =>v.call(el, e, viewmodel));
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
        if(vm) {
            binder.add(new BinderItem(el, vm));
        }
    }
};


const Data = class {
    getData() {
        const json = this._getData();
        return json;
    }

    _getData() {
        throw 'getData must override';
    }
};

const JsonData = class extends Data {
    constructor(data) {
        super();
        this._data = data;
    }

    _getData() {
        if(typeof this._data == 'string') {
            let data;
            $.ajax({
                method: 'get',
                dataType: 'json',
                contentType: 'application/json',
                url: this._data,
                async: false
            }).done((d) => {
                    this._data = data = d;
                });
            return data;
        } else return this._data;
    }
};
const Renderer = class {
    constructor() { }
    renderTable(data) {
        if(!(data instanceof Data))throw 'invalid data type';
        this._info = data._getData();
        return this._renderTable();
    }

    _renderTable() { throw '_render must override'; }

};

const TableRenderer = class extends Renderer {
    constructor() {
        super();
    }

    _renderTable() {
        return this._info.map((list, idx) => `<tr><td ${idx===0 ? 'id="clickevt" data-viewmodel="clickevt"' :''}>${list.id}</td><td>${list.first_name}</td><td>${list.last_name}</td><td>${list.email}</td></tr>`).join('');
    }
};
const data = new JsonData('./test.json');
const renderer = new TableRenderer();

const tableVM = ViewModel.get({
    tbody : ViewModel.get({
        properties: {
            innerHTML : renderer.renderTable(data)
        }
    })
});

//global
const scanner = new Scanner;


//local
const TableScanner = scanner.scan(document.querySelector('#test'));
TableScanner.render(tableVM); //redner 의 시점을 조절할수있는게 필요함

//local
const afterDrawScanner = scanner.scan(document.querySelector('#clickevt'));
const afterDrawVM = ViewModel.get({
    clickevt: ViewModel.get({
        events: {
            click(el, vm) {
                alert('test');
            }
        }
    })
});

afterDrawScanner.render(afterDrawVM);