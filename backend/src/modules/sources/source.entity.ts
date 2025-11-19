import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity('sources')
export class SourceEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 255 })
    name: string;

    @Column({ type: 'text' })
    url: string;

    @Column({ type: 'varchar', length: 50, default: 'threat_intel' })
    type: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    region: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    country: string;

    @Column({ type: 'varchar', length: 10, default: 'en' })
    language: string;

    @Column({ type: 'boolean', default: true })
    enabled: boolean;

    @Column({ name: 'fetch_interval_minutes', type: 'integer', default: 30 })
    fetchIntervalMinutes: number;

    @Column({ name: 'last_fetched_at', type: 'timestamp', nullable: true })
    lastFetchedAt: Date;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
