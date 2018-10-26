# appiconset-creator

Creates .appiconset directories for iOS projects.

I created this small tool because I got tired of dragging app icons into Xcode. The tool doesn't make any assumptions about your file namings. Instead looks at the actual sizes of your input files to determine where they go in the appiconset.

## Requirements

The tool depends on the `identify` command in ImageMagick. There's a good chance you already have ImageMagick installed, otherwise you can install it using `brew update && brew install imagemagick`.

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
