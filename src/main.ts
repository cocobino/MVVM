import ViewModel from "./mvvm/ViewModel.ts";
import Scanner from "./mvvm/Scanner.ts";

const  viewmodel = ViewModel.get({
    isStop: false,
    changeContents() {
        this.wrapper.styles.background = `rgb(${Math.random()},${Math.random()},${Math.random()})`
        this.contents.properties.innerHTML = Math.random().toString(16).replace('.', '')

    },
    wrapper: ViewModel.get({
        styles: {
            width: '200px',
            background: '',
        },
    }),
    title: ViewModel.get({
        properties: {
            innerHTML: 'Title'
        }
    }),
    contents: ViewModel.get({
        properties: {
            innerHTML: 'Contents'
        }
    }),
    events: {
        click(e, vm) {
            vm.isStop = true;
        }
    }
});



const f = () => {
    (viewmodel as any).changeContents();
    binder.render(viewmodel);
    if (!(viewmodel as any).isStop) requestAnimationFrame(f);
}
// requestAnimationFrame(f)


const scanner = new Scanner();
const binder = scanner.scan(document.querySelector('#target')!);
binder.render(viewmodel);