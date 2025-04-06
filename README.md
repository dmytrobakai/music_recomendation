## 📦 Architecture Diagram (Block-Based)

+--------------------+
| User Interface |
|--------------------|
| - Search songs |
| - Like/unlike |
| - View recs |
+--------------------+
|
v
+--------------------------+
| FastAPI Backend |
|--------------------------|
| /songs ---> [DB] |
| /like/{id} ---> [DB] |
| /liked ---> [DB] |
| /recommended ---> [Model + DB] |
| /search ---> [DB] |
| /external/search?q=... |
| ---> [Deezer API] |
+--------------------------+
|
v
+-----------------------------+
| External Music API (Deezer)|
+-----------------------------+

           ↑
           |

+-----------------------------+
| ML Pipeline (Offline) |
|-----------------------------|
| 1. Fetch new songs (API) |
| 2. Store in local DB |
| 3. Train recommender model |
| 4. Save model for use |
+-----------------------------+
