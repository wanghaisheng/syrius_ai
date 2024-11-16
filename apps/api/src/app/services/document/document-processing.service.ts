import { Injectable } from '@nestjs/common';
import {
  IDocumentProcessingService,
  RelevantDocument,
} from './document-processing.service.requirements';

const HIGH_RELEVANCE_THRESHOLD = 0.86;

@Injectable()
export class DocumentProcessingService implements IDocumentProcessingService {
  public calculateAverageScore(docs: RelevantDocument[]): number {
    if (docs.length === 0) {
      return 0;
    }

    const totalScore = docs.reduce((sum, doc) => sum + doc.score, 0);
    return totalScore / docs.length;
  }

  public combineContext(docs: RelevantDocument[]): string[] {
    const filteredDocs = this.filterHighRelevanceDocuments(docs);
    const uniqueDocs = this.getUniqueDocuments(filteredDocs);
    return this.formatDocumentsAsContext(uniqueDocs);
  }

  public checkDocumentConsistency(docs: RelevantDocument[]): boolean {
    const uniqueTexts = new Set(docs.map((doc) => doc.text));
    return uniqueTexts.size <= docs.length * 0.8;
  }

  private filterHighRelevanceDocuments(
    docs: RelevantDocument[]
  ): RelevantDocument[] {
    return docs.filter((doc) => doc.score >= HIGH_RELEVANCE_THRESHOLD);
  }

  private getUniqueDocuments(docs: RelevantDocument[]): string[] {
    const uniqueTexts = new Set(docs.map((doc) => doc.text));
    return Array.from(uniqueTexts);
  }

  private formatDocumentsAsContext(uniqueTexts: string[]): string[] {
    return uniqueTexts.join('\n\n').split('\n\n');
  }
}
