const ARIMA = require('arima');

const expenses = [200, 220, 250, 270, 300, 310];


let arima112 = new ARIMA({ p: 1, d:1 , q: 2 }).train(expenses);
let [pred112, errors112] = arima112.predict(3);
console.log("ARIMA(1,1,2) forecast:", pred112, "±", errors112);
const pred = arima112.predict(3);
for (let i = 0; i < pred[0].length; i++) {
    console.log(`Month ${i + 1}: ${Math.round(pred[0][i])} ± ${pred[1][i]}`);
}

