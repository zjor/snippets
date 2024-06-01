package drawutils

import (
	"fmt"
	"golang.org/x/image/font"
	"golang.org/x/image/font/opentype"
	"golang.org/x/image/math/fixed"
	"image"
	"image/color"
	"log"
	"os"
)

type Point struct {
	X int
	Y int
}

type FontFamily string

const (
	NunitoRegular FontFamily = "Nunito-Regular"
	RobotoRegular FontFamily = "Roboto-Regular"
	RobotoMono    FontFamily = "RobotoMono-Regular"
)

type FontOptions struct {
	Family FontFamily
	Size   int
	Color  color.RGBA
}

type PositionOptions int

const (
	TopLeft     PositionOptions = 0
	BottomRight PositionOptions = 1
	Center      PositionOptions = 2
)

var (
	home, _ = os.UserHomeDir()
	baseDir = home + "/.anki"
)

func getFontFace(family FontFamily, size float64) font.Face {
	f, err := os.ReadFile(fmt.Sprintf("%s/fonts/%s.ttf", baseDir, family))
	if err != nil {
		log.Fatal(err)
	}
	fnt, err := opentype.Parse(f)
	if err != nil {
		log.Fatal(err)
	}
	face, err := opentype.NewFace(fnt, &opentype.FaceOptions{
		Size:    size,
		DPI:     72,
		Hinting: font.HintingNone,
	})
	if err != nil {
		log.Fatal(err)
	}
	return face
}

func DrawText(dst *image.RGBA, text string, where Point, fontOpts FontOptions, position PositionOptions) {
	face := getFontFace(fontOpts.Family, float64(fontOpts.Size))
	d := &font.Drawer{
		Dst:  dst,
		Src:  image.NewUniform(fontOpts.Color),
		Face: face,
	}
	w := int((d.MeasureString(text)) >> 6)

	x, y := where.X, where.Y
	if position == BottomRight {
		x -= w
		y += fontOpts.Size
	} else if position == Center {
		x -= w / 2
		y += fontOpts.Size / 2
	}

	point := fixed.Point26_6{X: fixed.Int26_6(x << 6), Y: fixed.Int26_6(y << 6)}

	d.Dot = point
	d.DrawString(text)
}
