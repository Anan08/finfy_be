const arima = require('arima');

exports.forecast = (data, steps) => {
    const model = arima({p: 2, d: 1, q: 2, P: 1, D: 1, Q: 1, s: 12, verbose: false});
    model.train(data);
    const [predictions] = model.predict(steps);
    return predictions;
}