import Foundation

public struct GridPoint: Hashable {
    public let x: Int
    public let y: Int
}

public final class FloodFill {
    public enum Cell: Int {
        case empty
        case wall
        case enemy
        case captured
    }

    public let width: Int
    public let height: Int
    private var cells: [Cell]

    public init(width: Int, height: Int, cells: [Cell]) {
        self.width = width
        self.height = height
        self.cells = cells
    }

    public subscript(point: GridPoint) -> Cell {
        get { cells[point.y * width + point.x] }
        set { cells[point.y * width + point.x] = newValue }
    }

    public func capturedRegion(excluding enemyOrigins: [GridPoint]) -> Set<GridPoint> {
        var visited: Set<GridPoint> = []
        var queue: [GridPoint] = enemyOrigins
        visited.formUnion(enemyOrigins)

        while !queue.isEmpty {
            let current = queue.removeLast()
            for neighbour in neighbours(of: current) {
                guard !visited.contains(neighbour) else { continue }
                let cell = self[neighbour]
                if cell == .empty || cell == .enemy {
                    visited.insert(neighbour)
                    queue.append(neighbour)
                }
            }
        }

        var captured: Set<GridPoint> = []
        for y in 0..<height {
            for x in 0..<width {
                let point = GridPoint(x: x, y: y)
                if !visited.contains(point) && self[point] == .empty {
                    captured.insert(point)
                }
            }
        }
        return captured
    }

    private func neighbours(of point: GridPoint) -> [GridPoint] {
        [
            GridPoint(x: point.x + 1, y: point.y),
            GridPoint(x: point.x - 1, y: point.y),
            GridPoint(x: point.x, y: point.y + 1),
            GridPoint(x: point.x, y: point.y - 1)
        ].filter { $0.x >= 0 && $0.x < width && $0.y >= 0 && $0.y < height }
    }
}
