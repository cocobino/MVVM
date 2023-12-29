class ViewModel {
    static private: ViewModel;

    static get(data: Record<string, any>) {
        return new ViewModel(this.private, data);
    }

    styles = {};
    attributes = {};
    properties = {};
    events = {};

    constructor(checker: ViewModel, data: Record<string, any>) {
        if (checker != ViewModel.private) throw 'use Viewmodel.get()';

        Object.entries(data).forEach(([k, v]) => {
            switch (k) {
                case "styles":
                    this.styles = v;
                    break;
                case "attributes":
                    this.attributes = v;
                    break;
                case "properties":
                    this.properties = v;
                    break;
                case "events":
                    this.events = v;
                    break;
                default:
                    // @ts-ignore
                    this[k] = v; //custom key
            }
        });
        Object.seal(this);
    }


}

export default ViewModel