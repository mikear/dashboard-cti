import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    OneToMany,
    JoinColumn,
} from 'typeorm';
import { SourceEntity } from '../sources/source.entity';
import { IocEntity } from './ioc.entity';

@Entity('articles')
export class ArticleEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'source_id', type: 'uuid', nullable: true })
    sourceId: string;

    @ManyToOne(() => SourceEntity, { nullable: true })
    @JoinColumn({ name: 'source_id' })
    source: SourceEntity;

    // Original content
    @Column({ name: 'title_raw', type: 'text' })
    titleRaw: string;

    @Column({ name: 'body_raw', type: 'text' })
    bodyRaw: string;

    @Column({ name: 'summary_raw', type: 'text', nullable: true })
    summaryRaw: string;

    @Column({ name: 'source_url', type: 'text' })
    sourceUrl: string;

    @Column({ name: 'published_at', type: 'timestamp' })
    publishedAt: Date;

    @Column({ name: 'language_detected', type: 'varchar', length: 10, nullable: true })
    languageDetected: string;

    // Translated content (Spanish)
    @Column({ name: 'title_es', type: 'text', nullable: true })
    titleEs: string;

    @Column({ name: 'body_es', type: 'text', nullable: true })
    bodyEs: string;

    @Column({ name: 'summary_es', type: 'text', nullable: true })
    summaryEs: string;

    @Column({ name: 'translated_flag', type: 'boolean', default: false })
    translatedFlag: boolean;

    @Column({ name: 'confidence_translation', type: 'decimal', precision: 3, scale: 2, nullable: true })
    confidenceTranslation: number;

    // Metadata
    @Column({ name: 'fingerprint', type: 'varchar', length: 64, unique: true })
    fingerprint: string;

    @Column({ name: 'truncated', type: 'boolean', default: false })
    truncated: boolean;

    @Column({ name: 'tags', type: 'text', array: true, default: [] })
    tags: string[];

    // Enrichment flags
    @Column({ name: 'has_iocs', type: 'boolean', default: false })
    hasIocs: boolean;

    @Column({ name: 'ioc_count', type: 'integer', default: 0 })
    iocCount: number;

    @OneToMany(() => IocEntity, ioc => ioc.article)
    iocs: IocEntity[];

    // Timestamps
    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @Column({ name: 'indexed_at', type: 'timestamp', nullable: true })
    indexedAt: Date;
}
