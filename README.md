# SAP BO to Tableau Connector (BOT connector)

BOT connector provides facility to the user to connect SAP BO Universe to Tableau Desktop. Using this connector user can take advantage of both BI platforms. Here power of SAP backend + Metadata is merged with strong visualization of Tableau.

![BOT architecture](/BOT-architecture.png)

This connector has two parts:

## 1. BO Universe extraction

This module will extract the BO universe metadata information like Dimension, Measures, and Filters and save them into XML. This module will be deployed as scheduler on user machine. This scheduler will run nightly or on demand.

## 2. Tableau Connector

BOT connector connects the SAP BO Universe with Tableau so end users can easily access and analyze data.BOT connector is a web application which shows SAP Universe objects as data elements. 

In Tableau , select WDC data source and provide BOT connector URL. This will open BOT connector Web interface where all SAP BO universe objects get displayed. Now user can selects objects for report and click Generate button. Internally for selected objects a dynamic query gets created in SAP BO memory. For this query BOT connector fetched the data from SAP BO and show into Tableau.

In Tableau one workbook get created and all the selected objects will be displayed here as data elements. Now user can generate reports in Tableau.
