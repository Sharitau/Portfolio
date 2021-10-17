
#This programs compares data downloaded from a shapefile loaded on AGOL to data from an excel sheet on the local drive. The program find the records  from the excel sheet that
#aren't in the AGOL download and appends them to the AGOL download. Then it geocodes the new rows, deletes the existing layer from AGOL and reuploads the newly consolidated
#and geocoded layer

#!/usr/bin/env python
# coding: utf-8

# In[1]:


from IPython.core.display import display, HTML
display(HTML("<style>.container { width:100% !important; }</style>"))


# In[2]:


#Sets environment
from arcgis import GIS
from arcgis.geocoding import batch_geocode
from IPython.display import display
gis = GIS(username = '*******', password = '********')
import pandas as pd
import arcpy
import os
import shutil
arcpy.env.workspace = r"C:\Users\sunderwood\PythonPrograms\PythonScriptingforArcGISPro"


# In[3]:


#Imports toolbox to download layer from online
arcpy.ImportToolbox(r"C:\Users\sunderwood\PythonPrograms\PythonScriptingforArcGISPro\DownloadService")


# In[4]:


#Checks if shapefile folder exists. if not makes folder and downloads layer to shapefile folder. If so deletes folder, makes it and downloads shapefile
if not os.path.exists(r"C:\Users\sunderwood\PythonPrograms\PythonScriptingforArcGISPro\Shapefile"):
    os.makedirs(r"C:\Users\sunderwood\PythonPrograms\PythonScriptingforArcGISPro\Shapefile")
    arcpy.FeatureClassToFeatureClass_conversion(r"https://services5.arcgis.com/5RxyIIJ9boPdptdo/arcgis/rest/services/2021Permits/FeatureServer/0",r"C:\Users\sunderwood\PythonPrograms\PythonScriptingforArcGISPro\Shapefile", r"2021Permits")
else:
    shutil.rmtree(r"C:\Users\sunderwood\PythonPrograms\PythonScriptingforArcGISPro\Shapefile")
    os.makedirs(r"C:\Users\sunderwood\PythonPrograms\PythonScriptingforArcGISPro\Shapefile")
    arcpy.FeatureClassToFeatureClass_conversion(r"https://services5.arcgis.com/5RxyIIJ9boPdptdo/arcgis/rest/services/2021Permits/FeatureServer/0",r"C:\Users\sunderwood\PythonPrograms\PythonScriptingforArcGISPro\Shapefile", r"2021Permits")


# In[5]:


#Checks if excel file exists, if not does table to excel conversion if so deletes old excel file then does new conversion
if not os.path.exists(r"C:\Users\sunderwood\PythonPrograms\PythonScriptingforArcGISPro\Permits2021Excel.xlsx"):
    arcpy.TableToExcel_conversion(r"C:\Users\sunderwood\PythonPrograms\PythonScriptingforArcGISPro\Shapefile\2021Permits.shp","Permits2021Excel.xlsx")
else:
    os.remove(r"C:\Users\sunderwood\PythonPrograms\PythonScriptingforArcGISPro\Permits2021Excel.xlsx")
    arcpy.TableToExcel_conversion(r"C:\Users\sunderwood\PythonPrograms\PythonScriptingforArcGISPro\Shapefile\2021Permits.shp","Permits2021Excel.xlsx")


# In[6]:


pd.set_option('display.max_columns', None)
pd.set_option('display.max_rows', None)


# In[7]:


#Reads excel sheets as dataframes and changes name of X and Y in NPUExcel to Latitude and Longitude
NPUExcel = pd.read_excel(r"C:\Users\sunderwood\PythonPrograms\PythonScriptingforArcGISPro\Permits2021Excel.xlsx")
NPUExcel = NPUExcel.rename(columns={'USER_Month': 'Month1', 'USER_AppTy': 'AppType', 'USER_Addre': 'Address', 'X': 'Latitude', 'Y': 'Longitude', 'USER_Name': 'Name', 'USER_NPU': 'NPU', 'USER_Votin': 'Voting_Outcome' })
NPUNew = pd.read_excel(r"C:\Users\sunderwood\PythonPrograms\PythonScriptingforArcGISPro\ExcelAddresses1.xlsx")
NPUExcel = NPUExcel.drop(['USER_Latit','USER_Longi'], axis=1)
NPUExcel=NPUExcel.loc[:, ~NPUExcel.columns.str.startswith('USER_')]
NPUExcel


# In[8]:


NPUNew = NPUNew.drop(['Longitude','Latitude'], axis=1)
NPUNew = NPUNew.loc[:, ~NPUNew.columns.str.contains('^Unnamed')]
NPUNew


# In[9]:


#NPUNew['Voting_Outcome'] = 'abc'
#NPUNew


# In[10]:


#Looks at columns of each row and tells which rows are unique to each or shared between them
cols = ['Month1', 'AppType', 'Name', 'Address','NPU', 'Voting_Outcome']
merged = pd.merge(NPUExcel[cols], NPUNew, on=cols, how = 'outer', indicator = True)
merged


# In[11]:


#Merges the two dataframes keeping only items that were in both dataframes or the right one(NPUNew)
NPUExcel= (
    NPUExcel.loc[:,~NPUExcel.columns.duplicated()]
    .merge(NPUNew, on=cols, how='outer', indicator=True)
    .query('_merge != "left_only"')
    .drop(columns='_merge')
)
NPUExcel = NPUExcel.rename(columns={'Month1': 'Month',})
NPUExcel = NPUExcel.fillna(0)
NPUExcel
#NPUExcel = NPUExcel.drop(NPUExcel[-1], axis=1)
#del NPUExcel['USER_NPU_x', 'USER_Latit','USER_Longi','USER_FID']
#NPUExcel = NPUExcel.rename(columns={'Month1': 'Month', 'AppType': 'App Type',})
#NPUExcel.fillna(0)
#NPUExcel


# In[12]:


#Checks if new final excel file exists, if not does dataframe to table conversion if so deletes old excle file then does new conversion leaves out index column
if not os.path.exists(r"C:\Users\sunderwood\PythonPrograms\PythonScriptingforArcGISPro\FinalPermits2021Excel.xlsx"):
    NPUExcel.to_excel(r"C:\Users\sunderwood\PythonPrograms\PythonScriptingforArcGISPro\FinalPermits2021Excel.xlsx",index=False)
else:
    os.remove(r"C:\Users\sunderwood\PythonPrograms\PythonScriptingforArcGISPro\FinalPermits2021Excel.xlsx")
    NPUExcel.to_excel(r"C:\Users\sunderwood\PythonPrograms\PythonScriptingforArcGISPro\FinalPermits2021Excel.xlsx",index=False)


# In[13]:


#Checks if gdb file exists, if not does excel to table conversion if so deletes old table file then does new conversion
if not os.path.exists(r"C:\Users\sunderwood\PythonPrograms\PythonScriptingforArcGISPro\FinalPermits2021Excel.gdb"):
    arcpy.CreateFileGDB_management(r"C:\Users\sunderwood\PythonPrograms\PythonScriptingforArcGISPro", "FinalPermits2021Excel.gdb")
    arcpy.ExcelToTable_conversion(r"C:\Users\sunderwood\PythonPrograms\PythonScriptingforArcGISPro\FinalPermits2021Excel.xlsx",r"C:\Users\sunderwood\PythonPrograms\PythonScriptingforArcGISPro\FinalPermits2021Excel.gdb\FinalPermits2021Excel","Sheet1")
else:
    shutil.rmtree(r"C:\Users\sunderwood\PythonPrograms\PythonScriptingforArcGISPro\FinalPermits2021Excel.gdb")
    arcpy.CreateFileGDB_management(r"C:\Users\sunderwood\PythonPrograms\PythonScriptingforArcGISPro", "FinalPermits2021Excel.gdb")
    arcpy.ExcelToTable_conversion(r"C:\Users\sunderwood\PythonPrograms\PythonScriptingforArcGISPro\FinalPermits2021Excel.xlsx",r"C:\Users\sunderwood\PythonPrograms\PythonScriptingforArcGISPro\FinalPermits2021Excel.gdb\FinalPermits2021Excel","Sheet1")


# In[14]:


arcpy.env.overwriteOutput = True
address_table = r"C:\Users\sunderwood\PythonPrograms\PythonScriptingforArcGISPro\FinalPermits2021Excel.gdb\FinalPermits2021Excel"
address_locator = r"https://utility.arcgis.com/usrsvcs/servers/b4652533cc834fdf9d56af21a4c03b67/rest/services/World/GeocodeServer/Atlanta Address Search (ESRI)"
address_fields = "'Single Line Input' Address VISIBLE NONE"
geocode_result= r"C:\Users\sunderwood\PythonPrograms\PythonScriptingforArcGISPro\Shapefile\2021Permits.shp"

if not os.path.exists(r"C:\Users\sunderwood\PythonPrograms\PythonScriptingforArcGISPro\Shapefile"):
    os.makedirs(r"C:\Users\sunderwood\PythonPrograms\PythonScriptingforArcGISPro\Shapefile")
    with arcpy.da.UpdateCursor(r"C:\Users\sunderwood\PythonPrograms\PythonScriptingforArcGISPro\FinalPermits2021Excel.gdb\FinalPermits2021Excel", ["Latitude"]) as cursor:
        for row in cursor:
            if row[0] == 0:
                arcpy.GeocodeAddresses_geocoding(address_table, address_locator, address_fields, geocode_result,'STATIC', "US", "ROUTING_LOCATION", None)
else:
    shutil.rmtree(r"C:\Users\sunderwood\PythonPrograms\PythonScriptingforArcGISPro\Shapefile")
    os.makedirs(r"C:\Users\sunderwood\PythonPrograms\PythonScriptingforArcGISPro\Shapefile")
    with arcpy.da.UpdateCursor(r"C:\Users\sunderwood\PythonPrograms\PythonScriptingforArcGISPro\FinalPermits2021Excel.gdb\FinalPermits2021Excel", ["Latitude"]) as cursor:
        for row in cursor:
            if row[0] == 0:
                arcpy.GeocodeAddresses_geocoding(address_table, address_locator, address_fields, geocode_result,'STATIC', "US", "ROUTING_LOCATION", None)
                
                
                
                


# In[15]:


#zips files resulting from geocode
shutil.make_archive(r'C:\Users\sunderwood\PythonPrograms\PythonScriptingforArcGISPro\Shapefile\2021Permits', 'zip', r'C:\Users\sunderwood\PythonPrograms\PythonScriptingforArcGISPro\Shapefile')


# In[16]:


#Search for the feature service (shapefile)
ServiceSearch = gis.content.search(query="2021 NPU Applications")
FirstServiceSearchResult = ServiceSearch[0]
SecondServiceSearchResult = ServiceSearch[1]
FirstServiceSearchResult


# In[17]:


SecondServiceSearchResult


# In[18]:


#Checking to see if the ID's were actually pulled
Stapefile_ID = FirstServiceSearchResult.id
Layer_ID = SecondServiceSearchResult.id

print('Stapefile_ID ' + FirstServiceSearchResult.id)
print('Layer_ID is ' + SecondServiceSearchResult.id)


# In[19]:


#Deleting Feature Service and checking for its deletion
item_for_deletion1 = gis.content.get(Stapefile_ID)
item_for_deletion1.delete()
item_for_deletion2 = gis.content.get(Layer_ID)
item_for_deletion2.delete()


# In[20]:


#Path Directly to Data
my_stapefile = (r"C:\Users\sunderwood\PythonPrograms\PythonScriptingforArcGISPro\Shapefile\2021Permits.zip")
my_stapefile


# In[21]:


#Add the intial shapefile and publish it as a web layer
item_prop = {'title': '2021 NPU Applications', 'tags': 'GIS', 'type':'Shapefile'}
stapefile_item = gis.content.add(item_properties=item_prop, data=my_stapefile)
stapefile_item


# In[22]:


#Publish the shapefile item into a feature layer
Applications_item = stapefile_item.publish(publish_parameters=None, address_fields=None, output_type=None, overwrite=False, file_type=None, build_initial_cache=False)
#Applications_item = stapefile_item.publish()
Applications_item


# In[ ]:





# In[23]:


#Applications_item.update(item_properties={'title': '2021Applications'})
#Applications_item


# In[24]:


#Getting preferred symbology from webmap
#import json
#import sys
#item = gis.content.get('ed4f92c2642e4f57bf6c737e9ed16632')
#item_data = item.get_data()
# Include the below line for prettified JSON
#print(json.dumps(item_data, indent=4, sort_keys=True))


# In[25]:


#searchresult = gis.content.search(query="title:2021Applications", item_type="Feature Layer")
#found_item = searchresult[0]
#get_item = gis.content.get(found_item.id)
#get_item


# In[26]:


#onn = GIS(username = 'sunderwood_intern', password = 'Yellowbird123$')
#ayer_name = '2021Applications'

#ef update_wm_layerdef(item):
    #tem_data = item.get_data()

 #  print("*******************ORIGINAL DEFINITION*********************")
  # print(json.dumps(item_data, indent=4, sort_keys=True))
   ## Open JSON file containing symbology update
    #ith open('/path/to/webmaplyr.json') as json_data:
    #   data = json.load(json_data)

    # Set the item_properties to include the desired update
#   item_properties = {"text": json.dumps(data)}

    # 'Commit' the updates to the Item
 #  item.update(item_properties=item_properties)

    # Print item_data to see that changes are reflected
  # new_item_data = item.get_data()
   #print("***********************NEW DEFINITION**********************")
    #rint(json.dumps(new_item_data, indent=4, sort_keys=True))

#ef main():
 #  conn = GIS("https://machine.domain.com/portal", 
  #            "admin", "password")
    
    # Search for item, get item data)
   #item = search_item(conn, 'wm_lyrsym')
   #update_wm_layerdef(item)

#f __name__ == '__main__':
 #  exit(main())


# In[ ]:




