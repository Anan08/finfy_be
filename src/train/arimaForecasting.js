const arima = require('arima');

exports.forecast = (data, steps) => {
    const model = arima({p: 1, d: 1, q: 2, verbose: false});
    model.train(data);
    const [predictions] = model.predict(steps);
    return predictions;
}