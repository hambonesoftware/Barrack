import XCTest
@testable import BarrackPlus

final class FloodFillTests: XCTestCase {
    func testCapturedRegionExcludesEnemyReachableCells() {
        let width = 4
        let height = 4
        let cells: [FloodFill.Cell] = [
            .wall, .wall, .wall, .wall,
            .wall, .empty, .empty, .wall,
            .wall, .enemy, .empty, .wall,
            .wall, .wall, .wall, .wall
        ]
        let floodFill = FloodFill(width: width, height: height, cells: cells)
        let captured = floodFill.capturedRegion(excluding: [GridPoint(x: 1, y: 2)])
        XCTAssertTrue(captured.contains(GridPoint(x: 2, y: 1)))
        XCTAssertFalse(captured.contains(GridPoint(x: 1, y: 2)))
    }
}
