const natural = require('natural');
const classifier = new natural.BayesClassifier();
const csv = require('fast-csv');
const fs = require('fs');

exports.trainModel = (csvPath) => {
    return new Promise((resolve, reject) => {
        fs.createReadStream(csvPath)
        .pipe(csv.parse({ headers: true }))
        .on('data', (row) => {
            if (row.text && row.label) {
                classifier.addDocument(row.text, row.label);
            }
        })
        .on('end', () => {
            classifier.train();
            console.log('Model trained with provided CSV data.');
            resolve();
        });
    });
};

exports.classifyText = (text) => {
    
    if (!classifier.docs || classifier.docs.length === 0) {
        throw new Error('Model is not trained yet.');
    }

    return classifier.classify(text);
    
}