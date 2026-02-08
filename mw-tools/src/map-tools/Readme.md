# Map structure (incomplete)

-   All integers are stored in little endian.
-   All strings end with 0x1A

## MAP_HEAD

| Offset | Size | Description                  |
| -----: | ---: | ---------------------------- |
|      0 |  256 | Empty                        |
|  0x100 |   20 | "MAP_HEAD"                   |
|  0x128 |    4 | Pixels per x-coordinate (16) |
|  0x12C |    4 | Pixels per y-coordinate (8)  |
|  0x130 |    4 | Width                        |
|  0x134 |    4 | Height                       |
|  0x138 |    4 | Unknown (always 45?)         |
|  0x13C |    4 | Pointer to MAP_IMG section   |
|  0x140 |    4 | Pointer to EVENT section     |
|  0x144 |    4 | Pointer to CONTROL section   |

## MAP_IMG

Relative to the pointer in MAP_HEAD 0x13C.

| Offset | Size | Description                                       |
| -----: | ---: | ------------------------------------------------- |
|      0 |   20 | "MAP_IMG"                                         |
|   0x14 |    4 | Number of IMG_HEAD sections in file               |
|   0x18 |    4 | Pointer to start of list of pointers to IMG_HEADs |

## IMG_HEAD

Relative to the pointer in MAP_IMG 0x18.

| Offset | Size | Description               |
| -----: | ---: | ------------------------- |
|      0 |   20 | "IMG_HEAD"                |
|   0x14 |    4 | Pointer to the image data |
|   0x18 |    4 | Size of image data        |
|   0x1C |    4 | Image width               |
|   0x20 |    4 | Image height              |
|   0x24 |    4 | Origin x                  |
|   0x28 |    4 | Origin y                  |
|   0x2C |    2 | Center x                  |
|   0x2E |    2 | Center y                  |
|   0x30 |    1 | Layer                     |

To place an image within the parent image, the center coordinates of this image will be placed at the origin coordinates on the parent image.

When you do `layer & 0xC0` you get 128 (bottom), 64 (middle) or 192 (top), these are the 3 layers of a map.

All map files seem to contain one bottom layer, this is the first IMG_HEAD in the list. This is the base map-image.

### Bottom layer image data

Relative to the pointer in IMG_HEAD 0x14.

| Offset | Size | Description          |
| -----: | ---: | -------------------- |
|      0 |    4 | Column count         |
|   0x04 |    4 | Row count            |
|   0x08 | 1600 | List of jpg sizes    |
|  0x648 |    4 | Pointer to first jpg |

For 0x08:

-   Each row uses 80 bytes, with a maximum of 20 rows.
-   Each row consists of a maximum of 20 columns, 4 bytes per column.
-   Each field contains the length of the jpg data.
-   Each image is 800x600, so a map of 1600x1800 consists of 2 columns and 3 rows.

### Middle and top layer image data

Not yet implemented. Might use the same data format as MDA images.

## EVENT

Not yet implemented.

## CONTROL

Relative to the pointer in MAP_HEAD 0x144.

| Offset | Size | Description    |
| -----: | ---: | -------------- |
|      0 |   20 | "CONTROL"      |
|   0x14 |    4 | Effect count   |
|   0x18 |    4 | Link count     |
|   0x1C |    4 | Effect pointer |
|   0x20 |    4 | Link pointer   |

### Effects

Not yet implemented.

### Links

Relative to the pointer in CONTROL 0x20.

| Offset | Size | Description                           |
| -----: | ---: | ------------------------------------- |
|      0 |   80 | Map filename                          |
|   0x50 |    4 | ID (each link has a different number) |
|   0x54 |    4 | Start X                               |
|   0x58 |    4 | Start Y                               |
|   0x5C |    4 | End X                                 |
|   0x60 |    4 | End Y                                 |
|   0x64 |  120 | Chinese map name (GBK encoded)        |
