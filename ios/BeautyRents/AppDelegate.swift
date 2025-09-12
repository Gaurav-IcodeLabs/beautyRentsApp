import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider

@main
class AppDelegate: RCTAppDelegate {

  override func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey : Any]? = nil
  ) -> Bool {
    self.moduleName = "BeautyRents"
    self.dependencyProvider = RCTAppDependencyProvider()
    self.initialProps = [:]
    showSplashScreen()
    return super.application(application, didFinishLaunchingWithOptions: launchOptions)
  }

  //Add below method in AppDelegate.swift
    private func showSplashScreen() {
      if let splashClass = NSClassFromString("SplashView") as? NSObject.Type,
          let splashInstance = splashClass.perform(NSSelectorFromString("sharedInstance"))?.takeUnretainedValue() as? NSObject {
          splashInstance.perform(NSSelectorFromString("showSplash"))
          print("✅ Splash Screen Shown Successfully")
      } else {
          print("⚠️ SplashView module not found")
      }
    }


  override func sourceURL(for bridge: RCTBridge) -> URL? {
    self.bundleURL()
  }

  override func bundleURL() -> URL? {
#if DEBUG
    RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
#else
    Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }
}
