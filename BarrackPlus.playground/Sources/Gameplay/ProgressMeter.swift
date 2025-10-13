import Foundation

public final class ProgressMeter {
    private unowned let gameState: GameState

    public init(gameState: GameState) {
        self.gameState = gameState
    }

    public func capturePercent(capturedCells: Int, totalCells: Int) -> Double {
        guard totalCells > 0 else { return 0 }
        let percent = Double(capturedCells) / Double(totalCells)
        if percent >= gameState.currentLevel.targetPercent {
            gameState.checkWinLoseConditions()
        }
        return percent
    }
}
