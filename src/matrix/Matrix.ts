// Interface import
import { MatrixTypes } from "../@interfaces";


// Error import
import { MatrixError } from "../errors";

// Utility import
import { DELTA, MathUtils, MatrixUtils } from "../utils";


// Node import
import * as fs from "fs"
import * as os from 'os';



export class Matrix implements MatrixTypes {

    public shape: string = "0";
    public isSquare: boolean = false;
    public isTall: boolean = false;
    public isWide: boolean = false;

    public rows: number = Infinity;
    public columns: number = Infinity;
    public size: number = Infinity;
    public mElements: Float32Array;

    /**
     * Constructs a matrix object.
     * @param {number[][] | Float32Array} entries - The entries of the matrix.
     * @param {number} rows - The number of rows in the matrix.
     * @param {number} columns - The number of columns in the matrix.
     */
    constructor(entries: number[][] | Float32Array, rows?: number, columns?: number) {
        if (entries instanceof Float32Array) {
            if (rows === undefined || columns === undefined || typeof (rows) !== "number" || typeof (columns) !== "number" || columns <= 0 || rows <= 0) {
                throw new MatrixError("Rows and columns must be defined for Float32Array entries, be of type number and not be 0 or negative", 804);
            }

            this.validateFloatArray(entries);
            this.mElements = entries;
            this.rows = rows;
            this.columns = columns;
            this.size = rows * columns;
        } else {
            if (!this.validateMatrixEntries(entries)) {
                throw new MatrixError("Invalid matrix entries", 803);
            }

            const numRows: number = entries.length;
            const numCols: number = entries[0].length;
            this.mElements = new Float32Array(numRows * numCols);

            for (let i = 0; i < numRows; i++) {
                for (let j = 0; j < numCols; j++) {
                    const index: number = i * numCols + j;
                    this.mElements[index] = entries[i][j];
                }
            }

            this.rows = numRows;
            this.columns = numCols;
            this.size = numRows * numCols;
        }

        this.updateMatrix()
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////
    /*
    * Validation and updataers
    */
    /////////////////////////////////////////////////////////////////////////////////////////////////s

    /**
     * Validates the entries of a matrix to ensure they are of the correct form.
     * @private
     * @param {number[][]} entries - The entries of the matrix.
     * @returns {boolean} True if the entries are valid, false otherwise.
     */
    private validateMatrixEntries(entries: number[][]): boolean {
        const numRows: number = entries.length;
        if (numRows === 0) {
            return false;
        }

        const numCols: number = entries[0].length;
        if (numCols === 0) {
            return false;
        }

        for (let i = 0; i < numRows; i++) {
            if (!Array.isArray(entries[i]) || entries[i].length !== numCols) {
                return false;
            }

            for (let j = 0; j < numCols; j++) {
                if (typeof entries[i][j] !== 'number' || isNaN(entries[i][j])) {
                    return false;
                }
            }
        }

        return true;
    }


    /**
     * Validates the entries of a Float32Array to ensure they are valid.
     * @private
     * @param {Float32Array} entries - The entries of the matrix.
     * @returns {void}
     */
    private validateFloatArray(entries: Float32Array): void {
        for (let i = 0; i < entries.length; i++) {
            if (typeof entries[i] !== 'number' || isNaN(entries[i])) {
                throw new MatrixError("Invalid Float32Array entries", 805);
            }
        }
    }


    /**
    * Updates all aspects of Matrix.
    * @private
    * @returns {void}
    */
    private updateMatrix(): void {
        this.updateSpecification()
        this.updateShape()
    }

    /**
     * Updates matrix-related specifcation
     * @private
     * @returns {void}
     */
    private updateSpecification(): void {
        if (this.rows > this.columns) {
            this.isTall = !this.isTall
        } else if (this.columns > this.rows) {
            this.isWide = !this.isWide
        } else {
            this.isSquare = !this.isSquare
        }
    }


    /**
     * Updates the shape of the Matrix.
     * @private
     * @returns {void}
     */
    private updateShape(): void {
        this.shape = `(${this.rows},${this.columns})`;
    }



    /////////////////////////////////////////////////////////////////////////////////////////////////
    /*
    * Set- and getter methods
    */
    /////////////////////////////////////////////////////////////////////////////////////////////////

    /**
    * Gets the value of an element in the matrix.
    * @public
   * @param {number} row - The row index of the element starts from zero.
    * @param {number} column - The row index of the element starts from zero.
    * @returns {number} The value of the element.
    * @throws {MatrixError} - If index is out of bounds
    */
    public getElement(row: number, column: number): number {
        if (typeof row !== "number" || typeof column !== "number") throw new MatrixError("Invalid arugment", 606, { row, column })
        const index: number = row * this.columns + column;
        if (index > this.size || index < 0) throw new MatrixError("Index out of bounds", 800, { row, column });
        return this.mElements[index];
    }


    /**
     * Gets a specific row of the matrix.
     * @public
     * @param {number} rowIndex - The index of the row to retrieve (starting from 0).
     * @returns {number[]} An array representing the specified row of the matrix.
     * @throws {MatrixError} If the rowIndex is out of bounds.
     */
    public getRow(rowIndex: number): number[] {
        if (typeof rowIndex !== "number") throw new MatrixError("Invalid arugment", 606, { rowIndex })
        if (rowIndex < 0 || rowIndex >= this.rows) throw new MatrixError("Row index out of bounds", 800, { rowIndex });

        const row: number[] = [];
        const startIndex: number = rowIndex * this.columns;
        const endIndex: number = startIndex + this.columns;

        for (let i = startIndex; i < endIndex; i++) {
            row.push(this.mElements[i]);
        }

        return row;
    }

    /**
     * Gets a specific column of the matrix.
     * @public
     * @param {number} columnIndex - The index of the column to retrieve (starting from 0).
     * @returns {number[]} An array representing the specified column of the matrix.
     * @throws {MatrixError} If the columnIndex is out of bounds.
     */
    public getColumn(columnIndex: number): number[] {
        if (typeof columnIndex !== "number") throw new MatrixError("Invalid arugment", 606, { columnIndex })
        if (columnIndex < 0 || columnIndex >= this.rows) throw new MatrixError("Row index out of bounds", 800, { columnIndex });

        const column: number[] = [];
        const startIndex: number = columnIndex;
        const endIndex: number = this.rows * this.columns + columnIndex;

        for (let i = startIndex; i < endIndex; i += this.columns) {
            column.push(this.mElements[i]);
        }

        return column;
    }


    /**
     * Sets the value of an element in the matrix.
     * @public
     * @param {number} row - The row index of the element starts from zero.
     * @param {number} column - The row index of the element starts from zero.
     * @param {number} value - The value to set.
     * @returns {void}
     * @throws {MatrixError} - If the value is an invalid element or index is out of bounds
     */
    public setElement(row: number, column: number, value: number): void {
        if (typeof value !== "number" || typeof row !== "number" || typeof column !== "number") throw new MatrixError("Invalid arugment", 606, { value, row, column })
        const index: number = row * this.columns + column;
        if (index > this.size || index < 0) throw new MatrixError("Index out of bounds", 800, { row, column });
        this.mElements[index] = value;
    }

    /**
     * Retrieves a submatrix from the current matrix.
     * @public
     * @param {number} startRow - The starting row index of the submatrix.
     * @param {number} startCol - The starting column index of the submatrix.
     * @param {number} size - The size of the submatrix (number of rows and columns).
     * @returns {Matrix} A new Matrix object representing the submatrix.
     */
    public getSubmatrix(startRow: number, startCol: number, size: number): Matrix {
        const submatrixElements: Float32Array = new Float32Array(size * size);
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                const index: number = i * size + j;
                const originalIndex: number = (startRow + i) * this.columns + (startCol + j);
                submatrixElements[index] = this.mElements[originalIndex];
            }
        }
        return new Matrix(submatrixElements, size, size);
    }

    /**
     * @public
     * @param {number} startRow - The starting row index of the submatrix.
     * @param {number} startCol - The starting column index of the submatrix.
     * @param {number} submatrixElements - The elements of the submatrix to be set.
     */
    public setSubmatrix(startRow: number, startCol: number, submatrixElements: Float32Array): void {
        const size: number = Math.sqrt(submatrixElements.length);
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                const index: number = (startRow + i) * this.columns + (startCol + j);
                this.mElements[index] = submatrixElements[i * size + j];
            }
        }
    }


    /////////////////////////////////////////////////////////////////////////////////////////////////
    /*
    * Basic operations add, subtract, naiveMultiply,strassens and scale
    */
    /////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * Adds another matrix to this matrix.
     * @public
     * @param {Matrix} B - The matrix to add.
     * @returns {Matrix} The resulting matrix.
     */
    public add(B: Matrix): Matrix {
        if (this.shape !== B.shape) throw new MatrixError("Invalid matrix dimensions for addition", 805, { ARows: this.rows, AColumns: this.columns, BRows: B.rows, BColumns: B.columns });
        if (!(B instanceof Matrix)) throw new MatrixError("Argument is not an instance of Matrix", 804, { B });

        const resultElements: Float32Array = new Float32Array(this.mElements);
        const size: number = this.size;

        for (let i = 0; i < size; i++) {
            resultElements[i] += B.mElements[i];
        }

        return new Matrix(resultElements, this.rows, this.columns);
    }


    /**
     * Adds another matrix to this matrix. is async and faster
     * @public
     * @param {Matrix} B - The matrix to add.
     * @returns {Matrix} The resulting matrix.
     */
    public async addasync(B: Matrix): Promise<Matrix> {
        if (this.shape !== B.shape) throw new MatrixError("Invalid matrix dimensions for addition", 805, { ARows: this.rows, AColumns: this.columns, BRows: B.rows, BColumns: B.columns });
        if (!(B instanceof Matrix)) throw new MatrixError("Argument is not an instance of Matrix", 804, { B });

        const resultElements: Float32Array = new Float32Array(this.mElements);
        const size: number = this.size;

        // Calculate the chunk size based on the number of available processors
        const numProcessors: number = os.cpus().length;
        const chunkSize: number = Math.ceil(size / numProcessors);

        const promises: any[] = [];

        for (let i = 0; i < numProcessors; i++) {
            const start: number = i * chunkSize;
            const end: number = Math.min(start + chunkSize, size);

            promises.push(
                new Promise<void>((resolve) => {
                    // Perform addition in parallel for the chunk
                    for (let j = start; j < end; j++) {
                        resultElements[j] += B.mElements[j];
                    }
                    resolve();
                })
            );
        }

        // Wait for all promises to resolve
        await Promise.all(promises);
        return new Matrix(resultElements, this.rows, this.columns);
    }



    /**
     * Multiplies this matrix with another matrix using dynamic loop unrolling.
     * @public
     * @param {Matrix} B - The matrix to multiply with.
     * @returns {Matrix} The resulting matrix.
     */
    public naiveMultiply(B: Matrix): Matrix {
        if (this.columns !== B.rows) {
            throw new MatrixError("Invalid matrix dimensions for multiplication", 807, { rows: B.rows, columns: this.columns });
        }

        const rows: number = this.rows;
        const columns: number = this.columns;
        const matrixColumns: number = B.columns;
        const multipliersA: Float32Array = this.mElements;
        const multipliersB: Float32Array = B.transpose().mElements;

        const result: Float32Array = new Float32Array(rows * matrixColumns);

        const unrollingFactor: number = Math.min(columns, 16);

        for (let i = 0; i < rows; i++) {
            const rowOffsetA: number = i * columns;
            const rowOffsetResult: number = i * matrixColumns;

            for (let j = 0; j < matrixColumns; j++) {
                let sum: number = 0;
                const colOffsetB: number = j * unrollingFactor;

                for (let k = 0; k < columns; k += unrollingFactor) {
                    const limit: number = Math.min(k + unrollingFactor, columns);

                    for (let u = k; u < limit; u++) {
                        sum += multipliersA[rowOffsetA + u] * multipliersB[colOffsetB + u];
                    }
                }
                result[rowOffsetResult + j] = sum;
            }
        }

        return new Matrix(result, rows, matrixColumns);
    }

    /**
     * Scales the matrix and returns a new matrix with the result of the scaling
     * @public
     * @param {number} scalar - The scalar to scale the matrix with 
     * @returns {matrix} The scaled matrix
     */
    public scale(scalar: number): Matrix {
        if (typeof scalar !== "number") throw new MatrixError("Invalid scalar", 606, { scalar });
        const scaledMatrix: Matrix = MatrixUtils.clone(this);
        scaledMatrix.mElements = scaledMatrix.mElements.map((entry: number) => entry * scalar)
        return scaledMatrix;
    }



    /**
     * Performs matrix multiplication using Strassen's algorithm.
     * @param {Matrix} other - The matrix to multiply with.
     * @returns {Matrix} - The resulting matrix.
     */
    public strassenMultiply(other: Matrix): Matrix {
        // Check if matrices are square and have dimensions that are powers of 2
        const n: number = this.rows;
        if (!this.isSquare || !other.isSquare || this.columns !== other.rows || !MathUtils.isPowerOfTwo(n)) {
            throw new Error('Matrices must be square and have dimensions that are powers of 2');
        }

        // Base case: if dimensions are small enough, perform conventional matrix multiplication
        if (n <= 2) return this.naiveMultiply(other);

        // Divide matrices into submatrices
        const halfSize: number = n / 2;

        const A11: Matrix = this.getSubmatrix(0, 0, halfSize);
        const A12: Matrix = this.getSubmatrix(0, halfSize, halfSize);
        const A21: Matrix = this.getSubmatrix(halfSize, 0, halfSize);
        const A22: Matrix = this.getSubmatrix(halfSize, halfSize, halfSize);

        const B11: Matrix = other.getSubmatrix(0, 0, halfSize);
        const B12: Matrix = other.getSubmatrix(0, halfSize, halfSize);
        const B21: Matrix = other.getSubmatrix(halfSize, 0, halfSize);
        const B22: Matrix = other.getSubmatrix(halfSize, halfSize, halfSize);

        // Calculate the seven required products using the submatrices
        const P1: Matrix = A11.strassenMultiply(B12.subtract(B22));
        const P2: Matrix = A11.add(A12).strassenMultiply(B22);
        const P3: Matrix = A21.add(A22).strassenMultiply(B11);
        const P4: Matrix = A22.strassenMultiply(B21.subtract(B11));
        const P5: Matrix = A11.add(A22).strassenMultiply(B11.add(B22));
        const P6: Matrix = A12.subtract(A22).strassenMultiply(B21.add(B22));
        const P7: Matrix = A11.subtract(A21).strassenMultiply(B11.add(B12));

        // Calculate the resulting submatrices
        const C11: Matrix = P5.add(P4).subtract(P2).add(P6);
        const C12: Matrix = P1.add(P2);
        const C21: Matrix = P3.add(P4);
        const C22: Matrix = P5.add(P1).subtract(P3).subtract(P7);

        // Combine the resulting submatrices to form the final matrix C
        const C: Matrix = new Matrix(new Float32Array(n * n), n, n);
        C.setSubmatrix(0, 0, C11.mElements);
        C.setSubmatrix(0, halfSize, C12.mElements);
        C.setSubmatrix(halfSize, 0, C21.mElements);
        C.setSubmatrix(halfSize, halfSize, C22.mElements);

        return C;
    }


    /**
     * Subtracts another matrix from this matrix.
     * @public
     * @param {Matrix} B - The matrix to subtract.
     * @returns {Matrix} The resulting matrix.
     */
    public subtract(B: Matrix): Matrix {
        if (this.shape !== B.shape) throw new MatrixError("Invalid matrix dimensions for subtraction", 805, { ARows: this.rows, AColumns: this.columns, BRows: B.rows, BColumns: B.columns })
        if (!(B instanceof Matrix)) throw new MatrixError("Argument is not an instance of Matrix", 804, { B });

        const resultElements: Float32Array = new Float32Array(this.mElements);
        const size: number = this.size;

        for (let i = 0; i < size; i++) {
            resultElements[i] -= B.mElements[i];
        }

        return new Matrix(resultElements, this.rows, this.columns);
    }


    /////////////////////////////////////////////////////////////////////////////////////////////////
    /*
    * Solving systems
    */
    /////////////////////////////////////////////////////////////////////////////////////////////////


    /**
     * Performs back-substitution on an upper triangular matrix to solve
     * a system of linear equations.
     * @public
     * @returns {number[]} Solution to the system of linear equations
     *
     * @throws {MatrixError} if the matrix is not upper traiangluar, if b is not an array or if the matrix contains a zero on the diagonal (unsolvable system)
     */
    public backSubstitution(b: number[]): number[] {
        if (!Matrix.isUpperTriangular(this)) throw new MatrixError("Matrix is not upper triangular", 815, { matrix: this });
        if (!Array.isArray(b)) throw new MatrixError("b is not an array", 606, { b });


        const sol: number[] = [];
        const rows: number = this.rows;
        const columns: number = this.columns;


        for (let i = rows - 1; i >= 0; i--) {
            let currentDiag: number = this.getElement(i, i)
            if (currentDiag === 0) throw new MatrixError("Unsolvable system: zero on diagonal", 814, { matrix: this });
            let sum: number = 0
            for (let j = columns - 1; j > i; j--) {
                sum += sol[j] * this.getElement(i, j)
            }
            sol[i] = (b[i] - sum) / currentDiag
        }
        return sol;


    }


    /**
     * Performs back-substitution on an upper triangular matrix to solve
     * a system of linear equations.
     * @public
     * @returns {number[]} Solution to the system of linear equations
     *
     * @throws {MatrixError} if the matrix is not upper traiangluar, if b is not an array or if the matrix contains a zero on the diagonal (unsolvable system)
     */
    public forwardSubstitution(b: number[]): number[] {
        if (!Matrix.isLowerTriangular(this)) throw new MatrixError("Matrix is not lower triangular", 816, { matrix: this });
        if (!Array.isArray(b)) throw new MatrixError("b is not an array", 606, { b });

        const sol: number[] = [];
        const rows: number = this.rows;


        for (let i = 0; i < rows; i++) {
            let currentDiag: number = this.getElement(i, i)
            if (currentDiag === 0) throw new MatrixError("Unsolvable system: zero on diagonal", 814, { matrix: this });
            let sum: number = 0
            for (let j = 0; j < i; j++) {
                sum += sol[j] * this.getElement(i, j)
            }
            sol[i] = (b[i] - sum) / currentDiag
        }
        return sol;


    }

    /**
     * Performs QR decomposition on the matrix.
     * @returns { { Q: Matrix, R: Matrix } } An object containing the Q and R matrices.
     */
    public QRDecomposition(): { Q: Matrix, R: Matrix } {
        const Q: Matrix = this.gramSmith();
        const QT: Matrix = Q.transpose();
        const R: Matrix = QT.naiveMultiply(this);
        MatrixUtils.roundMatrixToZero(this)
        return { Q: Q, R: R };
    }


    /////////////////////////////////////////////////////////////////////////////////////////////////
    /*
    * Inverting
    */
    /////////////////////////////////////////////////////////////////////////////////////////////////


    /**
     * Inverts an upper triangular matrix.
     *
     * This function computes the inverse of an upper triangular matrix. If the matrix
     * is not square (meaning, the number of rows doesn't match the number of columns),
     * an error is thrown. To perform this inversion, an identity matrix is created
     * first. Then the function applies back substitution on each element in the
     * identity matrix, storing the results in a separate array. These results are
     * transposed, reversed, and returned
     * 
     * @returns {Matrix} The inverted upper triangular matrix.
     *
     * @throws {MatrixError} If the original matrix is not square or an upper triangular matrix, an error is thrown.
     */
    public invertUpper(): Matrix {
        //TODO: Psudo inverse
        if (!this.isSquare) throw new MatrixError("Uninvertable matrix: not a square matrix", 812, { matrix: this });
        if (!Matrix.isUpperTriangular(this)) throw new MatrixError("Matrix is not upper triangular", 815, { matrix: this });


        const identityMatrix: Matrix = Matrix.identity(this.rows);
        let invertedMatrixElements: number[][] = [];

        for (let i = this.rows - 1; i >= 0; i--) {
            invertedMatrixElements[i] = this.backSubstitution(identityMatrix.getRow(this.rows - i - 1));
        }

        invertedMatrixElements.reverse()


        return new Matrix(invertedMatrixElements).transpose();
    }

    /**
     * Inverts a lower triangular matrix.
     *
     * This function computes the inverse of an upper lower matrix. If the matrix
     * is not square (meaning, the number of rows doesn't match the number of columns),
     * an error is thrown. To perform this inversion, an identity matrix is created
     * first. Then the function applies foward substitution on each element in the
     * identity matrix, storing the results in a separate array. These results are
     * transposed, reversed, and returned.
     * 
     * @returns {Matrix} The inverted lower triangular matrix.
     *
     * @throws {MatrixError} If the original matrix is not square or a lower triangular matrix , an error is thrown.
     */
    public invertLower(): Matrix {
        //TODO: Psudo inverse
        if (!this.isSquare) throw new MatrixError("Uninvertable matrix: not a square matrix", 812, { matrix: this });
        if (!Matrix.isLowerTriangular(this)) throw new MatrixError("Matrix is not lower triangular", 815, { matrix: this });


        const identityMatrix: Matrix = Matrix.identity(this.rows);
        let invertedMatrixElements: number[][] = [];

        for (let i = 0; i < this.rows; i++) {
            invertedMatrixElements[i] = this.forwardSubstitution(identityMatrix.getRow(i));
        }

        // invertedMatrixElements.reverse()


        return new Matrix(invertedMatrixElements).transpose();
    }




    /////////////////////////////////////////////////////////////////////////////////////////////////
    /*
    * Utility methods
    */
    /////////////////////////////////////////////////////////////////////////////////////////////////


    /**
     * Prints the matrix in a formatted way.
     * @public
     * @returns {void}
     */
    public print(): void {
        const shape: number[] = [this.rows, this.columns];

        function col(mat: number[][], i: number): number[] {
            return mat.map(row => row[i]);
        }

        const colMaxes: number[] = [];
        for (let i = 0; i < shape[1]; i++) {
            colMaxes.push(Math.max(...col(this.toArray(), i).map(n => n.toString().length)));
        }

        this.toArray().forEach(row => {
            console.log(
                ...row.map((val, j) => {
                    return (
                        new Array(colMaxes[j] - val.toString().length + 1).join(" ") +
                        val.toString() +
                        "  "
                    );
                })
            );
        });
    }





    /**
     * Converts the matrix to a 2D array.
     * @public
     * @returns {number[][]} The matrix as a 2D array.
     */
    public toArray(): number[][] {
        const array: number[][] = [];

        for (let i = 0; i < this.rows; i++) {
            const row: number[] = [];
            for (let j = 0; j < this.columns; j++) {
                const value = this.getElement(i, j);
                row.push(value);
            }
            array.push(row);
        }

        return array;
    }

    /**
     * Converts the matrix to a printable string
     * @public
     * @returns {string} The printable matrix in a nice format
     */
    public toString(): string {
        const shape: number[] = [this.rows, this.columns];

        function col(mat: number[][], i: number): number[] {
            return mat.map(row => row[i]);
        }

        const colMaxes: number[] = [];
        for (let i = 0; i < shape[1]; i++) {
            colMaxes.push(Math.max(...col(this.toArray(), i).map(n => n.toString().length)));
        }

        let output: string = "";
        this.toArray().forEach(row => {
            output += row
                .map((val, j) => {
                    return (
                        new Array(colMaxes[j] - val.toString().length + 1).join(" ") +
                        val.toString() +
                        "  "
                    );
                })
                .join("") + "\n";
        });

        return output;
    }

    /**
     * Performs the Gram-Schmidt process for the columns of the given matrix. The process is an algorithm
     * to orthonormalize a set of vectors in an inner product space, generally Euclidean n-space.
     *
     * The method takes the columns (considered as vectors) of the current matrix instance and generates an orthogonal
     * set of vectors that spans the same column space as the original set. The set of orthonormal vectors is computed
     * sequentially by subtracting the projections of a matrix column vector onto the previously computed orthogonal 
     * vectors from the column vector itself.
     *
     * @returns {Matrix} A new Matrix instance constructed using the orthonormal vectors as columns.
     *
     * @throws {MatrixError} If any column obtained during the process is nearly zero (having euclidean norm lesser than a small
     * constant - `DELTA`). In this case, this means that the provided set is not linearly independent.
     *
     * @public
     */
    public gramSmith(): Matrix {
        const orthogonalColumns: number[][] = []

        orthogonalColumns.push(this.getColumn(0));

        const columns: number = this.columns;


        for (let i = 1; i < columns; i++) {
            let orthogonalProjection: number[] = [...this.getColumn(i)]; // Initialize orthogonalProjection as a copy of the current column

            for (let j = 0; j < i; j++) {
                let u: number[] = orthogonalColumns[j]
                let v: number[] = this.getColumn(i)
                let uv: number = Matrix.dot(u, v)
                let uu: number = Matrix.dot(u, u)
                let scalar: number = uv / uu;

                let projectionOf_I_onto_J: number[] = u.map((entry: number) => entry * scalar);

                orthogonalProjection = orthogonalProjection.map((entry: number, index: number) => entry - projectionOf_I_onto_J[index])

            }
            if ((Math.sqrt(orthogonalProjection.map(x => x ** 2).reduce((acc, x) => acc + x))) < DELTA) {
                throw new MatrixError("Cannot normalize a nearly-zero column. The given columns are not linearly independent.", 704);
            }
            orthogonalColumns.push(orthogonalProjection)

        }

        const normalizedColumns: number[][] = orthogonalColumns.map((column: number[]) => Matrix.normalize(column))
        const transposedArray: number[][] = normalizedColumns[0].map((_, colIndex) => normalizedColumns.map(row => row[colIndex]));
        return new Matrix(transposedArray);
    }

    /**
     * Transposes a matrix.
     * @public
     * @returns {Matrix} The transposed matrix.
     */
    public transpose(): Matrix {

        const transposedMatrix: Matrix = MatrixUtils.clone(this)
        const rows: number = transposedMatrix.rows;
        const columns: number = transposedMatrix.columns;

        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < columns; j++) {
                transposedMatrix.mElements[j * rows + i] = this.mElements[i * columns + j];
            }
        }
        transposedMatrix.rows = columns;
        transposedMatrix.columns = rows;

        if (transposedMatrix.isTall) {
            transposedMatrix.isTall = false;
            transposedMatrix.isWide = true;
        } else if (transposedMatrix.isWide) {
            transposedMatrix.isTall = true;
            transposedMatrix.isWide = false;
        }

        transposedMatrix.updateShape()

        return transposedMatrix;
    }



    /////////////////////////////////////////////////////////////////////////////////////////////////
    /*
    * Static methods
    */
    /////////////////////////////////////////////////////////////////////////////////////////////////


    /**
     * Calculates the dot product of two vectors.
     * @private
     * @static
     * @param {number[]} vector1 - The first vector.
     * @param {number[]} vector2 - The second vector.
     * @returns {number} The dot product of the two vectors.
     */
    private static dot(vector1: number[], vector2: number[]): number {
        let dotProduct: number = 0;
        for (let i = 0; i < vector1.length; i++) {
            dotProduct += vector1[i] * vector2[i]
        }
        return dotProduct;
    }

    /**
     * Normalizes a vector.
     * @private
     * @static
     * @param {number[]} vector1 - The vector to normalize.
     * @returns {number[]} The normalized vector.
     */
    private static normalize(vector1: number[]): number[] {
        let scalar: number = 1 / (Math.sqrt(vector1.map(x => x ** 2).reduce((acc, x) => acc + x)))
        return vector1.map((entry: number) => entry * scalar)
    }



    /**
     * Reshapes a 1D array into a matrix with the specified number of rows and columns.
     * @public
     * @static
     * @param {number[]} array - The 1D array to reshape.
     * @param {number} newRows - The number of rows in the reshaped matrix.
     * @param {number} newColumns - The number of columns in the reshaped matrix.
     * @returns {Matrix} The reshaped matrix.
     * @throws {MatrixError} - If the length of the array is not equal to newRows * newColumns.
     */
    public static reshape(array: number[], newRows: number, newColumns: number): Matrix {
        if (array.length !== newRows * newColumns) throw new MatrixError("Invalid reshape dimensions", 806, { newRows, newColumns });
        if (!Array.isArray(array) || typeof newRows !== "number" || typeof newColumns !== "number") throw new MatrixError("Invalid argument", 606, { array, newRows, newColumns });


        const newEntries: number[][] = [];
        let rowIndex: number = 0;
        let colIndex: number = 0;

        for (let i = 0; i < array.length; i++) {
            if (colIndex === newColumns) {
                rowIndex++;
                colIndex = 0;
            }

            if (!newEntries[rowIndex]) {
                newEntries[rowIndex] = [];
            }

            newEntries[rowIndex][colIndex] = array[i];
            colIndex++;
        }

        return new Matrix(newEntries);
    }



    /////////////////////////////////////////////////////////////////////////////////////////////////
    /*
    * Static boolean methods
    */
    /////////////////////////////////////////////////////////////////////////////////////////////////



    /**
     * Checks if a given matrix contains only integer elements.
     * @param A - The matrix to check.
     * @returns True if all elements in the matrix are integers, false otherwise.
     * @throws {MatrixError} If the argument is not an instance of Matrix.
     */
    public static isIntMatrix(A: Matrix): boolean {
        if (!(A instanceof Matrix)) throw new MatrixError("Argument is not an instance of Matrix", 804, { A });

        return A.mElements.every((entry: number) => Number.isInteger(entry));
    }


    /**
    * This method checks if the matrix is lower triangular.
    * A matrix is said to be lower triangular if all its entries above the main diagonal are zero.
    * @public
    * @static
    * @param {Matrix} A - The matrix to checkF
    * @return {Boolean} - Returns true if the matrix is lower triangular, false otherwise.
    */
    public static isLowerTriangular(A: Matrix): Boolean {
        if (!(A instanceof Matrix)) throw new MatrixError("Argument is not an instance of Matrix", 804, { A });
        const columns: number = A.columns;
        for (let i = 1; i < columns; i++) {
            for (let j = 0; j < i; j++) {
                if (A.getElement(j, i) !== 0) {
                    return false;
                }
            }
        }
        return true;
    }

    /**

    /**
     * This method checks if the given matrix is upper triangular.
     * A matrix is said to be upper triangular if all its entries below the main diagonal are zero.
     * @public
     * @static
     * @param {Matrix} A - The matrix to checkF
     * @return {Boolean}  Returns true if the matrix is upper triangular, false otherwise.
     */
    public static isUpperTriangular(A: Matrix): boolean {
        if (!(A instanceof Matrix)) throw new MatrixError("Argument is not an instance of Matrix", 804, { A });
        const columns: number = A.columns;
        for (let i = 1; i < columns; i++) {
            for (let j = 0; j < i; j++) {
                if (A.getElement(i, j) !== 0) {
                    return false;
                }
            }
        }
        return true;
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////
    /*
    * Static factory methods
    */
    /////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * Creates an identity matrix with the specified dimension.
     * @public
     * @static
     * @param {number} dimension - The dimension of the identity matrix.
     * @returns {Matrix} The identity matrix.
     * @throws {MatrixError} - If the dimension is less than or equal to 0.
     */
    public static identity(dimension: number): Matrix {
        if (dimension <= 0 || typeof dimension !== "number") throw new MatrixError("Invalid argument", 606, { dimension });

        const entries: number[][] = [];

        for (let i = 0; i < dimension; i++) {
            const row: number[] = [];
            for (let j = 0; j < dimension; j++) {
                if (i === j) {
                    row.push(1);
                } else {
                    row.push(0);
                }
            }
            entries.push(row);
        }

        return new Matrix(entries)
    }

    /**
     * Creates a matrix filled with ones with the specified number of rows and columns.
     * @public
     * @static
     * @param {number} rows - The number of rows in the matrix.
     * @param {number} columns - The number of columns in the matrix.
     * @returns {Matrix} - The matrix filled with ones.
     * @throws {MatrixError} - If the rows and or columns is less than or equal to 0.
     */
    public static ones(rows: number, columns: number): Matrix {
        if (rows <= 0 || columns <= 0 || typeof rows !== "number" || typeof columns !== "number") throw new MatrixError("Invalid argument", 606, { rows, columns });
        return new Matrix(new Array(rows).fill(1).map(() => new Array(columns).fill(1)))
    }


    /**
     * Creates a random matrix with the specified number of rows and columns.
     * @public
     * @static
     * @param {number} rows - The number of rows in the matrix.
     * @param {number} columns - The number of columns in the matrix
     * @returns {Matrix} The randomized matrix
     * @throws {MatrixError} - If the rows and or columns is less than or equal to 0.
     */
    public static random(rows: number, columns: number): Matrix {
        if (rows <= 0 || columns <= 0 || typeof rows !== "number" || typeof columns !== "number") throw new MatrixError("Invalid argument", 606, { rows, columns });

        const entries: number[][] = [];

        for (let i = 0; i < rows; i++) {
            const row: number[] = [];
            for (let j = 0; j <
                columns; j++) {
                const randomValue: number = Math.random() * 100;
                row.push(randomValue);
            }
            entries.push(row);
        }

        return new Matrix(entries);
    }


    /**
     * Creates a matrix filled with zeros with the specified number of rows and columns.
     * @public
     * @static
     * @param {number} rows - The number of rows in the matrix.
     * @param {number} columns - The number of columns in the matrix.
     * @returns {Matrix} - The matrix filled with zeros.
     * @throws {MatrixError} - If the rows and or columns is less than or equal to 0.
     */
    public static zeros(rows: number, columns: number): Matrix {
        if (rows <= 0 || columns <= 0 || typeof rows !== "number" || typeof columns !== "number") throw new MatrixError("Invalid argument", 606, { rows, columns });
        return new Matrix(new Array(rows).fill(0).map(() => new Array(columns).fill(0)))
    }


}

function writeArrayToFile(array: any, filePath: any) {
    // Convert the array to a string
    const arrayString = array.join('\n');

    // Write the array string to the file
    fs.writeFile(filePath, arrayString, (err) => {
        if (err) {
            console.error('Error writing to file:', err);
        } else {
            console.log('Array written to file successfully!');
        }
    });
}

function tester() {
    const a = [];
    for (let i = 1; i < 1001; i++) {
        let m1 = Matrix.ones(i, i);
        let s = performance.now();
        m1.naiveMultiply(m1);
        let e = performance.now();
        a.push((e - s) / 1000);
    }
    writeArrayToFile(a, "unroller.txt");
}

// tester();


// let m1 = Matrix.ones(1000, 1000);
// let s = performance.now();
// m1.naiveMultiply(m1);
// let e = performance.now();
// console.log((e - s) / 1000);
