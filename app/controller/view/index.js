const fs = require('fs');

module.exports.get = async (ctx, next) => {
    ctx.response.type = 'html';
    ctx.response.body = fs.readFileSync("./dist/index.html", {encoding: 'utf8', flag: 'r'});
}

module.exports.error = async (ctx, next) => {
    ctx.response.body = 'view error';
}
