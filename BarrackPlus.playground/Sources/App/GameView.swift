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
            HUDView()
                .environmentObject(gameState)
                .environmentObject(levelManager)
        }
        .onAppear {
            gameState.configure(with: levelManager.currentLevel)
        }
    }
}

private struct HUDView: View {
    @EnvironmentObject private var gameState: GameState
    @EnvironmentObject private var levelManager: LevelManager

    var body: some View {
        VStack {
            HStack {
                Text("Level \(levelManager.currentLevel.id)")
                Spacer()
                Text("Captured: \(Int(gameState.capturedPercent * 100))%")
                Spacer()
                Text("Lives: \(gameState.lives)")
            }
            .padding()
            Spacer()
            if let phase = gameState.overlayMessage {
                Text(phase)
                    .font(.headline)
                    .padding()
                    .background(.ultraThickMaterial)
                    .clipShape(RoundedRectangle(cornerRadius: 12))
                    .padding(.bottom, 32)
            }
        }
        .foregroundStyle(ColorPalette.active.primary)
    }
}
