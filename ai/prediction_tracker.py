"""
Prediction Tracker for ML Service
Logs all predictions to SQLite database for analytics and monitoring
"""

import sqlite3
import json
from datetime import datetime
from pathlib import Path

class PredictionTracker:
    def __init__(self, db_path='predictions.db'):
        self.db_path = db_path
        self.init_database()
    
    def init_database(self):
        """Initialize SQLite database with predictions table"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS predictions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT NOT NULL,
                input_type TEXT NOT NULL,
                disaster_type TEXT NOT NULL,
                danger_score INTEGER NOT NULL,
                confidence REAL NOT NULL,
                tags TEXT,
                input_preview TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def log_prediction(self, input_type, result, input_preview=None):
        """
        Log a prediction to the database
        
        Args:
            input_type: 'text', 'image', or 'audio'
            result: dict with disaster_type, danger_score, confidence, tags
            input_preview: optional preview of input (first 100 chars for text)
        """
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO predictions 
            (timestamp, input_type, disaster_type, danger_score, confidence, tags, input_preview)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            datetime.now().isoformat(),
            input_type,
            result.get('disaster_type', 'Unknown'),
            result.get('danger_score', 0),
            result.get('confidence', 0.0),
            json.dumps(result.get('tags', [])),
            input_preview[:100] if input_preview else None
        ))
        
        conn.commit()
        conn.close()
    
    def get_statistics(self, days=7):
        """
        Get aggregated statistics for the last N days
        
        Returns:
            dict with total_predictions, disaster_distribution, avg_danger_score, etc.
        """
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Total predictions
        cursor.execute('''
            SELECT COUNT(*) FROM predictions
            WHERE datetime(timestamp) >= datetime('now', '-' || ? || ' days')
        ''', (days,))
        total = cursor.fetchone()[0]
        
        # Disaster type distribution
        cursor.execute('''
            SELECT disaster_type, COUNT(*) as count
            FROM predictions
            WHERE datetime(timestamp) >= datetime('now', '-' || ? || ' days')
            GROUP BY disaster_type
            ORDER BY count DESC
        ''', (days,))
        disaster_dist = {row[0]: row[1] for row in cursor.fetchall()}
        
        # Input type distribution
        cursor.execute('''
            SELECT input_type, COUNT(*) as count
            FROM predictions
            WHERE datetime(timestamp) >= datetime('now', '-' || ? || ' days')
            GROUP BY input_type
        ''', (days,))
        input_dist = {row[0]: row[1] for row in cursor.fetchall()}
        
        # Average danger score
        cursor.execute('''
            SELECT AVG(danger_score) FROM predictions
            WHERE datetime(timestamp) >= datetime('now', '-' || ? || ' days')
        ''', (days,))
        avg_danger = cursor.fetchone()[0] or 0
        
        # Average confidence
        cursor.execute('''
            SELECT AVG(confidence) FROM predictions
            WHERE datetime(timestamp) >= datetime('now', '-' || ? || ' days')
        ''', (days,))
        avg_confidence = cursor.fetchone()[0] or 0
        
        conn.close()
        
        return {
            'total_predictions': total,
            'disaster_distribution': disaster_dist,
            'input_type_distribution': input_dist,
            'average_danger_score': round(avg_danger, 2),
            'average_confidence': round(avg_confidence, 3),
            'period_days': days
        }
    
    def get_recent_predictions(self, limit=50):
        """Get recent predictions"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT id, timestamp, input_type, disaster_type, danger_score, 
                   confidence, tags, input_preview
            FROM predictions
            ORDER BY id DESC
            LIMIT ?
        ''', (limit,))
        
        rows = cursor.fetchall()
        conn.close()
        
        predictions = []
        for row in rows:
            predictions.append({
                'id': row[0],
                'timestamp': row[1],
                'input_type': row[2],
                'disaster_type': row[3],
                'danger_score': row[4],
                'confidence': row[5],
                'tags': json.loads(row[6]) if row[6] else [],
                'input_preview': row[7]
            })
        
        return predictions
    
    def get_hourly_stats(self, hours=24):
        """Get predictions grouped by hour for the last N hours"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT 
                strftime('%Y-%m-%d %H:00', timestamp) as hour,
                COUNT(*) as count,
                AVG(danger_score) as avg_danger
            FROM predictions
            WHERE datetime(timestamp) >= datetime('now', '-' || ? || ' hours')
            GROUP BY hour
            ORDER BY hour
        ''', (hours,))
        
        rows = cursor.fetchall()
        conn.close()
        
        return [
            {
                'hour': row[0],
                'count': row[1],
                'avg_danger_score': round(row[2], 2)
            }
            for row in rows
        ]
