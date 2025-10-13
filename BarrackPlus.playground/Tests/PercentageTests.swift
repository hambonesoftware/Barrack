import XCTest
@testable import BarrackPlus

final class PercentageTests: XCTestCase {
    func testCaptureWinCondition() {
        let state = GameState()
        state.configure(with: Level(id: 99, seed: 1, targetPercent: 0.8, enemies: [], powerupRate: 0))
        state.reportCapture(count: 80, total: 100)
        XCTAssertTrue(state.isWin)
    }

    func testCaptureBelowThresholdDoesNotWin() {
        let state = GameState()
        state.configure(with: Level(id: 99, seed: 1, targetPercent: 0.8, enemies: [], powerupRate: 0))
        state.reportCapture(count: 79, total: 100)
        XCTAssertFalse(state.isWin)
    }
}
