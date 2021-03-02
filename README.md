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
/bin/mt4/kReal    EA程序, 切记不可以随便改已经运行的图表的周期，或者把其他图表替换当前图表  
kRealBackend.bat  运行EA后台，在Cmd窗口标题栏上右键->属性->选项->取消勾选“快速编辑模式" 防止阻塞  

## notes
KNN算法总结：
一开始统计的数据包含了自身临近的数据，所以导致最终结论十分离谱，一年EURUSD收益可以达到120倍  
统计数据去除自身临近数据后，EURUSD近两年的KNN计算同向性还算可以，日线达到53%左右相似度  
但是从2009年开始到2019进行计算的话，KNN同向性只有49.8%，没有任何参考意义  

KNN同向性的算法失败，实际上基本可以放弃其他基于历史价格数据的机器学习算法了，说明价格本身不具有规律，历史不会重现  
不过统计数据错误的时候发现，`usdcad usdjpy gbpusd eurusd`这些货币对相对其他的货币对稳一些，`USDCHF`是最不稳的货币对  

结束