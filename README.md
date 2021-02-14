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
                    历史回测优化时，先固定volume优化margin，根据盈利比得到范围，然后再同时优化volume和margin
                    margin 变大可以略微提高盈利率，但是也会减少符合的单量
/bin/mt4/kReal    EA程序  

## notes
5分钟不做，gabage in gabage out
15分钟的数据分析，结果比H1稍差，但是也很强
H1数据分析很强
H4不做，样本太少了，单量也少

H1优化参数 第一次：
gbpusd  cw = 0.24 margin = 0.0016
eurusd cw = 0.4 margin = 0
usdjpy cw = 0.4 margin = 0.0016 
nzdusd cw = 0.4 margin = 0.0016
usdcad cw = 0.3 margin = 0.0016
audusd cw = 0.2 margin = 0.0017
usdchf 亏损

H1优化参数 第二次：
gbpusd  cw = 0.36 margin = 0.0016  最大回撤69%  115倍
eurusd cw = 0.38  margin = 0.0016 最大回撤60% 119倍
usdjpy cw = 0.4 margin = 0.0016  最大回撤 62%  21.7倍
nzdusd cw = 0.38 margin = 0.0018 最大回撤 81%  5.9倍
usdcad cw = 0.4 margin = 0.0017 最大回撤 35%  119倍
audusd cw = 0.4 margin = 0.0014 最大回撤  77.5% 9.8倍
usdchf 亏损