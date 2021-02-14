必须自己去mt5上导出数据，因为ea只能初始化最近一段时间的数据
导出的文件夹在
C:\Users\15380\AppData\Roaming\MetaQuotes\Tester\D0E8209F77C8CF37AD8BF550E51FF075\Agent-127.0.0.1-3000\MQL5\Files
类似的位置
需要改名成EURUSD_H1.csv 格式
每次生成之后先拿出来，否则下次提取就会把文件给清了
要确认历史文件是完整的，前几次导出有可能是不完整的，也可能会少几条记录，影响不大