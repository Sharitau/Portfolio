import arcpy
import os
import shutil


powerline = r'PowerLine\PowerLine.shp'
parcel = r'Parcels\Parcels.shp'


#----------------------------------------------------------------------------------------------------------------------------------------#
#This portion of the program gets the length of the powerline in feet

#Sets curses through powerline and collects the length of the one feature and converts that into feet.
with arcpy.da.SearchCursor(powerline, "SHAPE@") as cursor:
    for geom, in cursor:
        length = (geom.length)
        powerlinelength_feet = length/5280  
        print("The length of the power line is ", powerlinelength_feet, "feet")



#----------------------------------------------------------------------------------------------------------------------------------------#
 #This portion of the program prints out attributes of the parcel shapefile       
 
#sets functin list fields to a variable then cursors through the variable printing out specific things
parcelfields = arcpy.ListFields(parcel)
 
for field in parcelfields:
      print(field.name, field.type, field.length)
      
      
#----------------------------------------------------------------------------------------------------------------------------------------#      
#This portion of the program only prints out parcels that are crossed be the powerline




#This block line a selection of all the parcels that are intersected by the powerline and creates kind of a ghost table
selection = arcpy.management.SelectLayerByLocation(r'Parcels\Parcels.shp', "INTERSECT", r'PowerLine\PowerLine.shp', None, "NEW_SELECTION", "NOT_INVERT")

#This block queries data from the ghost table and pulls out the site address and area
with arcpy.da.SearchCursor(selection, ('SITUSADDR', "AREA")) as cursor:
    for row in cursor:
        print(row)
    


#----------------------------------------------------------------------------------------------------------------------------------------#
 #This portion of the code creates a buffer and then creates a feature class of all parcels that fall within that buffer.
 
 #this block checks if the geodatabse exists. If it does it deletes entire geodatabase, if not, it moves on to next task
if os.path.exists(r'PowerLine\newfeature.gdb'):
    shutil.rmtree(r'PowerLine\newfeature.gdb')

#creates a geodatabse to store feature class that will be created
else:
    path =  r'PowerLine'
    outname = "newfeature.gdb"
    arcpy.CreateFileGDB_management(path, outname)

#this line creates my buffer and names it to be used for selection
    arcpy.analysis.Buffer(r"PowerLine\PowerLine.shp", r"PowerLine\newfeature.gdb\bufferpy1", "250 Feet", "FULL", "ROUND", "NONE", None, "PLANAR")
  
#this selects the parcels that are completely within the buffer and assigns it to  variable selection  
    selection = arcpy.management.SelectLayerByLocation("Parcels\Parcels.shp", "COMPLETELY_WITHIN",r"PowerLine\newfeature.gdb\bufferpy1", None, "NEW_SELECTION", "NOT_INVERT")
    
#this writes the selected features to my geodatabase.
    arcpy.CopyFeatures_management(selection, r"PowerLine\newfeature.gdb\parcelselection")
    
  