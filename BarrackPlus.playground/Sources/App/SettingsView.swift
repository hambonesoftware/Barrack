import SwiftUI

public struct SettingsView: View {
    @AppStorage("reducedMotion") private var reducedMotion = BuildFlags.REDUCED_MOTION
    @AppStorage("selectedPalette") private var selectedPalette = ColorPalette.Kind.default

    public init() {}

    public var body: some View {
        Form {
            Section("Accessibility") {
                Toggle("Reduced Motion", isOn: $reducedMotion)
            }
            Section("Palette") {
                Picker("Color Palette", selection: $selectedPalette) {
                    ForEach(ColorPalette.Kind.allCases, id: \.self) { kind in
                        Text(kind.displayName).tag(kind)
                    }
                }
            }
        }
        .navigationTitle("Settings")
    }
}
