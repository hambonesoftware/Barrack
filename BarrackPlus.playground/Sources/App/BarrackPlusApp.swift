import SwiftUI

@main
public struct BarrackPlusApp: App {
    @StateObject private var levelManager = LevelManager()

    public init() {}

    public var body: some Scene {
        WindowGroup {
            GameView()
                .environmentObject(levelManager)
        }
    }
}
