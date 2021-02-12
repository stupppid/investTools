## 配置
influxDB: 

create database mt5;

schema: 
hst:
tag: symbol period
field: low high open close valume rate
timstamp

knnHst:
tag: symbol period inputLength
field: records statistics
timstamp

## 使用说明
/bin/mt4/GetData  历史数据导出工具
/bin/mt4/test     历史回测工具，使用该项目计算后，用 bin/algoTest 导出计算的文件，然后放入mt4数据文件夹下，进行历史回测
/bin/mt4/kReal    EA程序