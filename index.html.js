const API_BASE_URL = 'http://localhost:7071'

const app = new Vue({
    el: '#app',
    data() { 
        return {
            stocks: []
        }
    },
    methods: {
        getStocks: async function () {
            try {
                const apiUrl = `${API_BASE_URL}/api/getStocks`;
                const response = await axios.get(apiUrl);
                app.stocks = response.data;
            } catch (ex) {
                console.error(ex);
            }
        },
        add() {
            app.stocks.push({ symbol: "John", id: "john"});
        },
        del() {
            app.stocks.splice(2,1);
        },
        change() {
            const [stock] = app.stocks;
            const updatedStock = { ...stock, price: '$777.03'};
            app.stocks.splice(0, 1, updatedStock);
        }
    }
});

const connect = () => {
    const connection = new signalR.HubConnectionBuilder().withUrl(`${API_BASE_URL}/api`).build();

    connection.serverTimeoutInMilliseconds = (1000 * 60) * 5;

    app.getStocks();

    connection.onclose(()  => {
        console.log('SignalR connection disconnected');
        setTimeout(() => connect(), 2000);
    });

    connection.start().then(() => {
        console.log("SignalR connection established");
    });

    connection.on('updated', updatedStock => {
        const index = app.stocks.findIndex(s => s.id === updatedStock.id);
        app.stocks.splice(index, 1, updatedStock);
    });
};

connect();
