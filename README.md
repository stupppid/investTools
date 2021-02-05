初始化使用github上提供的[模板](https://github.com/HeCoffee/koa2-template )

influxDB: 

create database mt5;

schema: hst
tag: symbol period
field: low high open close valume rate
timstamp

knnHistory: knnHst
tag: symbol period inputLength 
field: assumes 记录计算的数据的开始点
timstamp 作为记录的开始点