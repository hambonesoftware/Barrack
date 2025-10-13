import SwiftUI
import SpriteKit

public struct GameView: View {
    @EnvironmentObject private var levelManager: LevelManager
    @StateObject private var gameState = GameState()

    public init() {}

    public var body: some View {
        ZStack {
            SpriteView(scene: gameState.scene)
                .ignoresSafeArea()
            RetroHUDView()
                .environmentObject(gameState)
                .environmentObject(levelManager)
        }
        .onAppear {
            gameState.configure(with: levelManager.currentLevel)
        }
    }
}
