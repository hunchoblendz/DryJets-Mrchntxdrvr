import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { Anthropic } from '@anthropic-ai/sdk';

/**
 * LeoCreativeDirectorService
 *
 * Handles content repurposing across multiple platforms
 * Transforms blog posts into optimized content for each channel
 * - Blog to LinkedIn posts
 * - Blog to Instagram captions
 * - Blog to TikTok scripts
 * - Blog to Email campaigns
 * - Content variation generation
 */
@Injectable()
export class LeoCreativeDirectorService {
  private logger = new Logger('LeoCreativeDirector');
  private anthropic: Anthropic;

  constructor(private prisma: PrismaService) {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  /**
   * Repurpose blog post across multiple platforms
   */
  async repurposeBlogPost(
    blogPostId: string,
    platforms: string[] = ['linkedin', 'instagram', 'email'],
    campaignId?: string,
  ): Promise<any> {
    this.logger.log(
      `[Leo] Repurposing blog post: ${blogPostId} for platforms: ${platforms.join(', ')}`,
    );

    // Get blog post
    const blogPost = await this.prisma.blogPost.findUnique({
      where: { id: blogPostId },
    });

    if (!blogPost) {
      throw new Error('Blog post not found');
    }

    // Repurpose for each platform
    const repurposedContent: any[] = [];

    for (const platform of platforms) {
      const content = await this.repurposeForPlatform(
        blogPost,
        platform.toLowerCase(),
      );

      // Save repurposed content
      const saved = await this.prisma.repurposedContent.create({
        data: {
          sourceId: blogPostId,
          campaignId,
          format: platform.toUpperCase(),
          content: content.text,
          status: 'DRAFT',
          performanceData: {
            platform,
            charCount: content.text.length,
            estimatedEngagement: content.estimatedEngagement,
            keyPoints: content.keyPoints,
            cta: content.cta,
          },
        },
      });

      repurposedContent.push({
        platform,
        content: saved,
      });

      this.logger.log(`[Leo] Created ${platform} content for blog: ${blogPostId}`);
    }

    // Update blog post repurpose count
    await this.prisma.blogPost.update({
      where: { id: blogPostId },
      data: {
        repurposedCount: {
          increment: repurposedContent.length,
        },
      },
    });

    return {
      blogPostId,
      repurposedContent,
      summary: `Successfully repurposed blog post across ${repurposedContent.length} platforms`,
    };
  }

  /**
   * Repurpose content for a specific platform
   */
  private async repurposeForPlatform(
    blogPost: any,
    platform: string,
  ): Promise<any> {
    const prompt = this.buildRepurposePrompt(blogPost, platform);

    const message = await this.anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const response = JSON.parse(
      message.content[0].type === 'text' ? message.content[0].text : '{}',
    );

    return {
      text: response.content,
      cta: response.cta,
      keyPoints: response.keyPoints,
      hashtags: response.hashtags,
      estimatedEngagement: response.estimatedEngagement,
      platform,
    };
  }

  /**
   * Build repurposing prompt based on platform
   */
  private buildRepurposePrompt(blogPost: any, platform: string): string {
    const basePrompt = `
You are Leo, an expert content creator specializing in ${platform} content.

Transform this blog post into platform-optimized content:

Blog Title: "${blogPost.title}"
Blog Excerpt: "${blogPost.excerpt}"
Key Keywords: ${blogPost.keywords.join(', ')}

Create ${platform} content following these guidelines:
`;

    const platformPrompts: Record<string, string> = {
      linkedin: `
Format as a professional LinkedIn post (150-300 words):
- Open with a hook/insight
- Share key takeaway from blog
- Include 3-5 key points
- Add professional CTA
- Include relevant hashtags (3-5)

Return as JSON: { "content": "...", "cta": "...", "keyPoints": [...], "hashtags": [...], "estimatedEngagement": "high" }
      `,
      instagram: `
Format as Instagram caption (100-150 words with line breaks):
- Hook that grabs attention
- 2-3 key insights
- Relevant emoji
- Call-to-action
- 5-8 hashtags

Return as JSON: { "content": "...", "cta": "...", "keyPoints": [...], "hashtags": [...], "estimatedEngagement": "very_high" }
      `,
      tiktok: `
Format as TikTok script (30-60 seconds when spoken):
- Attention hook (first 3 seconds)
- 2-3 quick tips/insights
- Visual suggestions
- End with value/CTA

Return as JSON: { "content": "...", "cta": "...", "keyPoints": [...], "hashtags": [...], "estimatedEngagement": "very_high" }
      `,
      email: `
Format as email body (150-300 words):
- Subject line suggestion
- Friendly greeting
- Key insight/problem
- 2-3 solutions from blog
- Link to full blog
- CTA for engagement

Return as JSON: { "content": "...", "cta": "...", "keyPoints": [...], "hashtags": [], "estimatedEngagement": "medium" }
      `,
      twitter: `
Format as Twitter thread (5-7 tweets):
- Hook tweet (main insight)
- Supporting tweets with details
- Visual suggestions
- Final CTA tweet

Return as JSON: { "content": "...", "cta": "...", "keyPoints": [...], "hashtags": [...], "estimatedEngagement": "high" }
      `,
    };

    return (
      basePrompt +
      (platformPrompts[platform] ||
        platformPrompts['linkedin']) +
      `

Ensure the content is:
- Engaging and platform-native
- Includes a clear call-to-action
- Uses appropriate tone for the platform
- Optimized for visibility
- Actionable and valuable
    `
    );
  }

  /**
   * Generate content variations
   */
  async generateVariations(
    sourceContent: string,
    count: number = 3,
    platform?: string,
  ): Promise<any> {
    this.logger.log(
      `[Leo] Generating ${count} content variations for ${platform || 'general'}`,
    );

    const prompt = `
You are Leo, an expert at creating engaging content variations.

Original content:
"${sourceContent}"

Create ${count} variations of this content that:
1. Maintain the core message
2. Use different angles/perspectives
3. Vary tone and style
4. Increase engagement potential
${platform ? `5. Optimize for ${platform}` : ''}

Return as JSON with array:
{
  "variations": [
    { "content": "...", "angle": "...", "tone": "...", "expectedCTR": "high" },
    ...
  ]
}
    `;

    const message = await this.anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const response = JSON.parse(
      message.content[0].type === 'text' ? message.content[0].text : '{}',
    );

    return {
      originalContent: sourceContent,
      variations: response.variations,
      count: response.variations.length,
    };
  }

  /**
   * Optimize content for character limits
   */
  async optimizeForLength(
    content: string,
    maxLength: number,
    platform?: string,
  ): Promise<string> {
    if (content.length <= maxLength) {
      return content;
    }

    const prompt = `
You are an expert content editor.

Reduce this content to maximum ${maxLength} characters while maintaining key message:

"${content}"

${platform ? `Optimize for ${platform}.` : ''}
Keep it engaging and clear. Just return the optimized content, no JSON.
    `;

    const message = await this.anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    return message.content[0].type === 'text'
      ? message.content[0].text.substring(0, maxLength)
      : content.substring(0, maxLength);
  }

  /**
   * Generate platform-specific recommendations
   */
  async getPlatformRecommendations(content: string): Promise<any> {
    const prompt = `
You are a content strategy expert.

Analyze this content and recommend the best platforms to share it:

"${content}"

Provide recommendations as JSON:
{
  "recommendations": [
    {
      "platform": "linkedin",
      "suitability": "high/medium/low",
      "reason": "...",
      "estimatedReach": 5000,
      "suggestedTone": "professional"
    },
    ...
  ]
}

Include at least 5 major platforms.
    `;

    const message = await this.anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const response = JSON.parse(
      message.content[0].type === 'text' ? message.content[0].text : '{}',
    );

    return response.recommendations;
  }

  /**
   * Get repurposed content for a blog post
   */
  async getRepurposedContent(blogPostId: string): Promise<any> {
    const content = await this.prisma.repurposedContent.findMany({
      where: { sourceId: blogPostId },
      orderBy: { createdAt: 'desc' },
    });

    return {
      blogPostId,
      total: content.length,
      byFormat: {
        social: content.filter((c) => c.format === 'SOCIAL').length,
        email: content.filter((c) => c.format === 'EMAIL').length,
        ads: content.filter((c) => c.format === 'ADS').length,
      },
      content,
    };
  }

  /**
   * Update repurposed content status
   */
  async updateRepurposedContentStatus(
    contentId: string,
    status: string,
    metadata?: any,
  ): Promise<any> {
    return this.prisma.repurposedContent.update({
      where: { id: contentId },
      data: {
        status,
        performanceData: metadata,
        updatedAt: new Date(),
      },
    });
  }
}
