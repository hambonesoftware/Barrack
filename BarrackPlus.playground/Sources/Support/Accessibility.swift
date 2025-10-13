import SwiftUI

public enum AccessibilityOptions {
    public static func applyReducedMotion(_ isEnabled: Bool) {
        #if canImport(UIKit)
        if isEnabled {
            UIAccessibility.post(notification: .announcement, argument: "Reduced motion enabled")
        }
        #endif
    }
}
