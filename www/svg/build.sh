for f in *.svg; do convert +antialias  -background none -density 200 $f `echo $f |sed s/svg/png/`; done
