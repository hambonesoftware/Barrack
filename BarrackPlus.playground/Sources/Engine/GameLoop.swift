import Foundation
import SpriteKit

public final class GameLoop {
    private weak var gameState: GameState?
    private var lastUpdate: TimeInterval?

    public init(gameState: GameState) {
        self.gameState = gameState
    }

    public func update(currentTime: TimeInterval) {
        guard let gameState else { return }
        defer { lastUpdate = currentTime }
        let delta = lastUpdate.map { currentTime - $0 } ?? 1.0 / 60.0
        gameState.step(deltaTime: delta)
    }
}
