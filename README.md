# demo-of-profiling-ssr-without-fastboot

This is a small demo showing the lower level APIs that `fastboot` implements.
It is meant to provide insight into just what is happening under the hood in
the `fastboot` package. It can also serve as a way to profile fastboot
_without_ the sandboxing that is normally done.

In order to run this little demo, you need to do:

```
ember build
node render-page.js
```

As you can see the application is super tiny, but the general technique done
here should work across nearly any normal ember-cli based Ember application.
