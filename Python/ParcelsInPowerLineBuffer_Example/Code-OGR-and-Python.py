#--------------------------------------------------------------------------------------------------------------------------------------#
#This portion of the program makes sure all files and open and be read and exits the program is either of them can't be
#imports necessary modules
from osgeo import ogr
from osgeo import gdalconst
import sys
import os
#from dbf import *
#dbf1 = Dbf()

#Assigns variables to the file names for simplicity
fpowerline = r'PowerLine\PowerLine.shp'
fparcels = r'Parcels\Parcels.shp'

#sets the driver to a variable for simplicity in reading shapefiles later
driver = ogr.GetDriverByName('ESRI Shapefile')

#sets the reading of each shapefile to a variable
powerline = driver.Open(fpowerline, gdalconst.GA_ReadOnly)
parcels = driver.Open(fparcels, gdalconst.GA_ReadOnly)

#exists the program if either file is not found
if powerline is None:
    print('failed to open powerline file')
    sys.exit(1)
if parcels is None:
    print('failed to parcels file')
    sys.exit(1)

#--------------------------------------------------------------------------------------------------------------------------------------#
#The portion calculates the length of the feature in the powerline shapefile 
    
#gets the first and only layer name in powerline
layer_powerline = powerline.GetLayer(0)
layerName_powerline = layer_powerline.GetName() #layer name is PowerLine

#access non spatial info and tells me how many features there are when print statment is added
Defpowerline = layer_powerline.GetLayerDefn()
FCpowerline = Defpowerline.GetFieldCount() #only 1 feature

#gets the one and only feature of the shapefile and its geometry. Calculates the length based on that geometry
#and converts it to feet from miles then prints out the measurement
feature_powerline = layer_powerline.GetFeature(0)
geometry_powerline = feature_powerline.geometry()
powerlinelength_feet = geometry_powerline.Length()/5280
print('The length of the power line is',powerlinelength_feet,'feet')


#--------------------------------------------------------------------------------------------------------------------------------------#
#This portion prints out all attribute names and data types of the parcels shapefile
layer_parcels = parcels.GetLayer(0)

#Get layer definition and field count
Defparcels = layer_parcels.GetLayerDefn()
FCparcels = Defparcels.GetFieldCount()

#loops through field count to print out field names and data types
for i in range(FCparcels):
    pFieldDef = Defparcels.GetFieldDefn(i)
    fldName = pFieldDef.GetNameRef()
    fldType = pFieldDef.GetType()
    fldTypes = pFieldDef.GetFieldTypeName(fldType)
    print(fldName, fldTypes)
    
 
    
    
    

#--------------------------------------------------------------------------------------------------------------------------------------#
#This portion uses the above portion but extends it to print out each owner's addres and the area of every parcel crossed by powerline 

#sets variable for feature to be used to loop through features
pfeaturecount = layer_parcels.GetFeatureCount()
print(pfeaturecount)


#loops through features to extract each individual record(parcel) and its geometry
for i in range(pfeaturecount):
    pfeat = layer_parcels.GetFeature(i)
    pgeom = pfeat.GetGeometryRef()

#Test to see if the geometry of the parcel is cross by the power line. If it is extracts and prints out address and area of parcel    
    if pgeom.Crosses(geometry_powerline):
      oaddress = pfeat.GetField('SITUSADDR')
      area = pfeat.GetField('Area')
      print('The owner''s address is', oaddress, 'and the area of the parcel is', area)
    
   
 #-----------------------------------------------------------------------------------------------------------------------------------#
 #Makes a layer of all parcels within 250 feet of powerlines

#writes new layer using driver from earlier in code and sets projection to that of original parcel layer
bufferWidth = 250

#Checks if the .shps whch will be created alreads exist. If not create them. Is so delete and create them. If can't create exit system
if os.path.exists('NewParcels.shp'):
    os.remove('NewParcels.shp')
if os.path.exists('Buffer.shp'):
    os.remove('Buffer.shp')

try:
    dsparcel = driver.CreateDataSource('NewParcels.shp')
    dsbuffer = driver.CreateDataSource('Buffer.shp')
except: 
    print('coundn''t create either', dsparcel, 'or', dsbuffer)
    sys.exit(1)
    

#Creates parcel layer to hold parcels that fit criteria. Sets same spatial ref as orig parcel file If can't create layer exists system
SRSparcel =  layer_parcels.GetSpatialRef()    
newlayerparcel = dsparcel.CreateLayer('NewParcels', SRSparcel, ogr.wkbPolygon)
if newlayerparcel is None:
    print('Couldn''t create later for parcel')
    sys.exit(1)

#Sets field name and definitions to same as orig parcel file
for j in range(FCparcels):
    pFieldDef2 = Defparcels.GetFieldDefn(j)
    pfldName2 = pFieldDef2.GetNameRef()
    fldType2 = pFieldDef.GetType()
    newlayerDef = ogr.FieldDefn(pfldName2, fldType2)
    newlayerparcel.CreateField(newlayerDef)







#Create buffer layer to compare parcel location to. If can't create layer exits system. Sets spatail ref to powerline
SRSbuffer = layer_powerline.GetSpatialRef()
bufferlayer = dsbuffer.CreateLayer('Buffer',SRSbuffer, ogr.wkbPolygon)
if bufferlayer is None:
    print('Couldn''t create layer for buffer')
    sys.exit(1)

#creates buffer layer definition
bufferlayerDef = bufferlayer.GetLayerDefn()

#work through input features and buffer the geometry of each
featureID = 0
origfeature = layer_powerline.GetNextFeature()

while origfeature:
   buffergeometry = origfeature.GetGeometryRef()
   buffer = buffergeometry.Buffer(bufferWidth)
  
   try:
      bufferfeature = ogr.Feature(bufferlayerDef) #create feature
      bufferfeature.SetGeometry(buffer)        #add geometry
      bufferfeature.SetFID(featureID)          #set id
      bufferlayer.CreateFeature(bufferfeature)    #add feature to layer
      
      
   except:
      print("error adding buffer")

      bufferfeature.Destroy()
      origfeature.Destory
    
   origfeature = layer_powerline.GetNextFeature()
   featureID += 1

 
#loops through orig parcel again. if orig parcel is in buffer writes that record to new parcel layer otherwise passes        
for j in range(pfeaturecount):
    pfeat2 = layer_parcels.GetFeature(j)
    pgeom2 = pfeat2.GetGeometryRef()
    if pgeom2.Within(buffer):
        newlayerparcel.CreateFeature(pfeat2)
    else:
        pass   

    
    
    
    
#closes all shapefiles so they can be used and written again
dsparcel.Destroy()
dsbuffer.Destroy()
powerline.Destroy()
parcels.Destroy()


