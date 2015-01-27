for f in src/*.svg; do convert +antialias  -background none -density 200 $f `echo $f |sed s/src\\\/// |sed s/svg/png/`; done
