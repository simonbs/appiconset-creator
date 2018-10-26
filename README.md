# appiconset-creator

Creates .appiconset directories for iOS projects. I created this small tool because I got tired of dragging app icons into Xcode.

## Installation

```bash
npm install -g git+ssh://git@github.com:simonbs/appiconset-creator.git
```

## Usage

The program takes the following parameters:

| Argument           | Description                                                        |
|--------------------|--------------------------------------------------------------------|
| -i, --input [DIR]  | Directory containing PNG files to put into appiconset.             |
| -o, --output [DIR] | Directory to create the appiconset in. Usually your asset catalog. |
| -n, --name [NAME]  | Name of the create appiconset. Defaults to AppIcon.                |
| -r, --remove       | Specify to remove an existing appiconset at the output path.       |

### Usage Example

```bash
appiconset-creator -i ~/Desktop -o ~/Developer/MyApp/MyApp/Assets.xcassets
```
